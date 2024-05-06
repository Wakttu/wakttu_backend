import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketService } from './socket.service';
import { Inject, UseGuards, forwardRef } from '@nestjs/common';
import { SocketAuthenticatedGuard } from 'src/auth/socket-auth.guard';
import { CreateRoomDto } from 'src/room/dto/create-room.dto';
import { Room } from 'src/room/entities/room.entity';
import { KungService } from 'src/kung/kung.service';

interface Chat {
  roomId: string;
  chat: string;
}

export class Game {
  constructor() {
    this.host = '';
    this.round = 0;
    this.turn = 0;
    this.users = [];
  }
  host: string;
  type: number;
  round: number;
  turn: number;
  total: number;
  users: string[];
  keyword: string;
  target: string;
}

@UseGuards(SocketAuthenticatedGuard)
@WebSocketGateway({ namespace: 'wakttu' })
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @Inject(forwardRef(() => KungService))
    private readonly kungService: KungService,
    private readonly socketService: SocketService,
  ) {}

  @WebSocketServer()
  public server: Server;

  // 서버에 연결된 사용자 정보
  public user: {
    [socketId: string]: any;
  } = {};

  // 게임방의 정보
  public roomInfo: {
    [roomId: string]: Room;
  } = {};

  // 게임 진행 정보
  public game: {
    [roomId: string]: Game;
  } = {};

  // 접속시 수행되는 코드
  handleConnection(@ConnectedSocket() client: any) {
    if (!client.request.user) return;
    this.user[client.id] = client.request.user;
    this.server.emit('list', this.user);
  }

  // 소켓서버가 열릴시 수행되는 코드
  async afterInit() {
    await this.socketService.deleteAllRoom();
    this.kungService.server = this.server; // 서버를 service와 연결
    console.log('socket is open!');
  }

  // 소켓연결이 끊어지면 속해있는 방에서 나가게 하는 코드
  async handleDisconnect(client: any) {
    if (!client.request.user) return;
    const roomId = this.user[client.id].roomId;
    if (roomId) {
      await this.socketService.exitRoom(this.user[client.id].id);
      this.roomInfo[roomId] = await this.socketService.getRoom(roomId);
      if (
        this.roomInfo[roomId].users &&
        this.roomInfo[roomId].users.length > 0
      ) {
        this.game[roomId].host = this.roomInfo[roomId].users[0].name;
        this.server.to(roomId).emit('exit', this.roomInfo[roomId]);
      } else {
        delete this.roomInfo[roomId];
        delete this.game[roomId];
        await this.socketService.deleteRoom(roomId);
      }
    }
    delete this.user[client.id];
    this.server.emit('list', this.user);
  }

  // server에 접속해있는 모든 클라이언트에게 msg 보내기
  @SubscribeMessage('alarm')
  handleAlarm(@MessageBody() message: string) {
    this.server.emit('alarm', { message });
  }

  // 서버에접속해있는 유저에게 현재 방들의 정보 List 전달
  @SubscribeMessage('roomList')
  async handleRoomList(@ConnectedSocket() client: Socket) {
    const roomList = await this.socketService.getRoomList();
    client.emit('roomList', roomList);
  }
  // 게임 방에서 대화
  @SubscribeMessage('chat')
  async handleMessage(
    @MessageBody() { roomId, chat }: Chat,
    @ConnectedSocket() client: Socket,
  ) {
    if (this.game[roomId].users[this.game[roomId].turn] === client.id) {
      switch (this.roomInfo[roomId].type) {
        case 0:
          await this.handleAnswer({ roomId, chat });
          break;
        case 1:
          await this.handleKungAnswer({ roomId, chat });
          break;
        case 2:
          await this.handleAnswer({ roomId, chat });
          break;
      }
    } else
      this.server
        .to(roomId)
        .emit('chat', { name: this.user[client.id].name, chat: chat });
  }

  // 게임 방 생성
  @SubscribeMessage('createRoom')
  async handleCreate(
    @MessageBody() data: CreateRoomDto,
    @ConnectedSocket() client: any,
  ) {
    this.user[client.id] = client.request.user;
    const info = await this.socketService.createRoom(
      this.user[client.id].id,
      data,
    );
    const { password, ...room } = info;
    this.roomInfo[room.id] = room;
    this.game[room.id] = new Game();
    this.game[room.id].host = this.user[client.id].name;
    client.emit('createRoom', { roomId: room.id, password });
  }

  // 게임 방 입장
  @SubscribeMessage('enter')
  async handleEnter(
    @MessageBody() { roomId, password }: { roomId: string; password: string },
    @ConnectedSocket() client: any,
  ) {
    if (client.rooms.has(roomId)) {
      return;
    }
    if (!this.roomInfo[roomId]) return;

    const check = await this.socketService.checkPassword(roomId, password);
    if (!check) {
      client.emit('alarm', '유효하지 않은 패스워드 입니다.');
      return;
    }

    this.roomInfo[roomId] = await this.socketService.enterRoom(
      this.user[client.id].id,
      roomId,
    );
    client.join(roomId);
    this.user[client.id].roomId = roomId;
    this.server.to(roomId).emit('enter', this.roomInfo[roomId]);
  }

  // 게임방 퇴장
  @SubscribeMessage('exit')
  async handleExit(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (!client.rooms.has(roomId)) {
      return;
    }
    await this.socketService.exitRoom(this.user[client.id].id);
    this.roomInfo[roomId] = await this.socketService.getRoom(roomId);
    client.leave(roomId);
    if (this.roomInfo[roomId].users.length > 0) {
      this.game[roomId].host = this.roomInfo[roomId].users[0].name;
      this.server.to(roomId).emit('exit', this.roomInfo[roomId]);
    } else {
      delete this.roomInfo[roomId];
      delete this.game[roomId];
      await this.socketService.deleteRoom(roomId);
    }
  }

  // 강퇴기능
  @SubscribeMessage('kick')
  handleKick(
    @MessageBody() { roomId, userId }: { roomId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (this.user[client.id].name !== this.game[roomId].host) {
      return;
    }
    const key = Object.keys(this.user).find(
      (key) => this.user[key].id === userId,
    );

    client.to(key).emit('kick helper', { socketId: key });
  }

  @SubscribeMessage('kick helper')
  async hanldeKickHelper(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    await this.handleExit(roomId, client);
    client.emit('alarm', '퇴장 당하셨습니다.');
  }

  // 유저들의 ready 확인
  @SubscribeMessage('ready')
  handleReady(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const index = this.game[roomId].users.indexOf(client.id);
    if (index === -1) {
      this.game[roomId].users.push(client.id);
    } else {
      this.game[roomId].users.splice(index, 1);
    }
    this.server.to(roomId).emit('ready', this.game[roomId].users);
  }

  // 게임 시작시 주제 단어 선정
  @SubscribeMessage('start')
  async handleStart(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (this.game[roomId].host !== this.user[client.id].name) {
      return;
    }
    if (this.game[roomId].users.length !== this.roomInfo[roomId].users.length)
      return;
    this.game[roomId].total = this.game[roomId].users.length;
    this.game[roomId].keyword = await this.socketService.setWord(
      this.roomInfo[roomId].round,
    );
    await this.socketService.setStart(roomId, this.roomInfo[roomId].start);
    this.server.to(roomId).emit('start', this.game[roomId]);
  }

  /* 모듈분리까지 잠깐 주석처리
  @SubscribeMessage('round')
  handleRound(@MessageBody() roomId: string) {
    const curRound = this.game[roomId].round++;
    const lastRound = this.roomInfo[roomId].round;
    if (curRound === lastRound) {
      this.server.emit('end', { msg: 'end' });
      return;
    }
    const target = this.game[roomId].keyword['_id'];
    this.game[roomId].target = target[curRound];
    this.server.to(roomId).emit('round', this.game[roomId]);
  }*/

  // 답변
  async handleAnswer(@MessageBody() { roomId, chat }: Chat) {
    const check = await this.socketService.findWord(chat);
    if (check) {
      this.game[roomId].turn++;
      this.game[roomId].turn %= this.game[roomId].total;
      const target = check['id'];
      this.game[roomId].target = target[target.length - 1];
    }
    this.server.to(roomId).emit('turn', this.game[roomId]);
  }

  // Get 변수
  @SubscribeMessage('info')
  handleInfo(@ConnectedSocket() client: Socket) {
    client.emit('info', {
      game: this.game,
      user: this.user,
      roomInfo: this.roomInfo,
    });
  }

  /*
    kung kung tta handler
  */

  @SubscribeMessage('kung.start')
  async handleKungStart(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (this.game[roomId].host !== this.user[client.id].name) {
      return;
    }
    if (this.game[roomId].users.length !== this.roomInfo[roomId].users.length)
      return;
    await this.kungService.handleStart(
      roomId,
      this.roomInfo[roomId],
      this.game[roomId],
    );
  }

  @SubscribeMessage('kung.round')
  handleKungRound(@MessageBody() roomId: string) {
    const curRound = this.game[roomId].round++;
    const lastRound = this.roomInfo[roomId].round;
    if (curRound === lastRound) {
      this.server.emit('end', { msg: 'end' });
      return;
    }
    const target = this.game[roomId].keyword['_id'];
    this.game[roomId].target = target[curRound];
    this.server.to(roomId).emit('kung.round', this.game[roomId]);
  }

  async handleKungAnswer(
    @MessageBody() { roomId, chat }: { roomId: string; chat: string },
  ) {
    if (chat.length !== 3) {
      this.server
        .to(roomId)
        .emit('alarm', { message: '길이가 3이지 않습니다.' });
      return;
    }
    const check = await this.socketService.findWord(chat);
    if (check) {
      this.game[roomId].turn += 1;
      this.game[roomId].turn %= this.game[roomId].total;
      const target = check['id'];
      this.game[roomId].target = target[target.length - 1];
    }
    this.server.to(roomId).emit('kung.game', { answer: chat });
    this.server.to(roomId).emit('turn', this.game[roomId]);
  }

  @SubscribeMessage('kung.ban')
  handleKungBan(
    @MessageBody() { roomId, keyword }: { roomId: string; keyword: string },
    @ConnectedSocket() client: any,
  ) {
    const index = this.game[roomId].users.indexOf(client.id);
    this.kungService.handleBan(roomId, index, keyword);
    client.emit('kung.ban', { message: '금지단어 설정완료' });
  }
}
