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
import { UseGuards } from '@nestjs/common';
import { SocketAuthenticatedGuard } from 'src/auth/socket-auth.guard';
import { CreateRoomDto } from 'src/room/dto/create-room.dto';
import { Room } from 'src/room/entities/room.entity';

interface Chat {
  roomId: string;
  chat: string;
}

class Game {
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
  constructor(private readonly socketService: SocketService) {}

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

  // 방접속해있는 유저에게  List 전달
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
      this.handleAnswer({ roomId, chat });
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
    const room = await this.socketService.createRoom(
      this.user[client.id].id,
      data,
    );
    this.roomInfo[room.id] = room;
    this.game[room.id] = new Game();
    this.game[room.id].host = this.user[client.id].name;
    client.emit('createRoom', this.roomInfo[room.id]);
  }

  // 게임 방 입장
  @SubscribeMessage('enter')
  async handleEnter(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: any,
  ) {
    if (client.rooms.has(roomId)) {
      return;
    }
    if (!this.roomInfo[roomId]) return;
    this.user[client.id].roomId = roomId;
    this.roomInfo[roomId] = await this.socketService.enterRoom(
      this.user[client.id].id,
      roomId,
    );
    client.join(roomId);

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
  }

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
}
