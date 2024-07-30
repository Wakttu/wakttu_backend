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
import { SocketAuthenticatedGuard } from 'src/socket/socket-auth.guard';
import { CreateRoomDto } from 'src/room/dto/create-room.dto';
import { Room } from 'src/room/entities/room.entity';
import { KungService } from 'src/kung/kung.service';
import { LastService } from 'src/last/last.service';
import { WakQuizService } from 'src/wak-quiz/wak-quiz.service';
import { Quiz } from 'src/quiz/entities/quiz.entity';
import { UpdateRoomDto } from 'src/room/dto/update-room.dto';

interface Chat {
  roomId: string;
  chat: string;
  roundTime: number | undefined;
  turnTime: number | undefined;
  score: number | undefined;
}

export class Game {
  constructor() {
    this.host = ''; // 호스트
    this.round = 0; // 현재 라운드
    this.turn = 0; // 현재 누구의 턴인지 자리 index 값
    this.users = []; // 유저들의 정보가 들어있는 칸 위의 turn과 index를 같이사용
    this.chain = 0; // 현재 몇 체인인지 보여주는 정보
    this.roundTime = 60000; // 라운드 남은 시간 처음시작 60초
    this.turnTime = 20000; // 턴 남은 시간 처음시작 20초
  }
  host: string; // 호스트
  type: number; // 게임종류 0:끝말잇기 1:쿵쿵따 2:왁타버스 퀴즈
  round: number; // 현재 라운드
  turn: number; // 현재 누구의 턴인가 보여주는 index
  total: number; // 총인원수
  users: { id: string; score: number; userId: string }[]; // user의 socketId 정보가 들어가있음. 점수정보포함
  keyword: string | undefined; // 바탕단어 (이세계아이돌)
  target: string | Quiz; // 현재 게임 진행에서 사용될 단어 (세)
  option: boolean[] | undefined; // [매너,품어,외수] 설정이 되어있을때 true,false로 확인 가능
  chain: number; // 현재 체인정보
  roundTime: number; // 남은 라운드시간 정보
  turnTime: number; // 남은 턴 시간 정보
  mission: string | undefined; // 끝말잇기에서 사용될 미션단어
  quiz: Quiz[] | undefined; // 퀴즈 정보
}

@UseGuards(SocketAuthenticatedGuard)
@WebSocketGateway({
  namespace: 'wakttu',
  cors: { origin: true, credentials: true },
})
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @Inject(forwardRef(() => LastService))
    private readonly lastService: LastService,
    @Inject(forwardRef(() => KungService))
    private readonly kungService: KungService,
    @Inject(forwardRef(() => WakQuizService))
    private readonly wakQuizService: WakQuizService,
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
    const user = client.request.session.user;
    if (!user) {
      client.disconnect();
      return;
    }
    for (const key in this.user) {
      if (this.user[key].id === user.id) {
        client.emit('alarm', { message: '이미 접속중인 유저입니다!' });
        client.disconnect();
        return;
      }
    }
    this.user[client.id] = user;
    this.server.emit('list', this.user);
  }

  // 소켓서버가 열릴시 수행되는 코드
  async afterInit() {
    // 다시열릴시 존재하는 방 모두 삭제
    await this.socketService.deleteAllRoom();
    // 서버를 service와 연결
    this.lastService.server = this.server;
    this.kungService.server = this.server;
    this.wakQuizService.server = this.server;
    console.log('socket is open!');
  }

  // 소켓연결이 끊어지면 속해있는 방에서 나가게 하는 코드
  async handleDisconnect(client: any) {
    const user = client.request.session.user;
    if (!user) return;
    const roomId = this.user[client.id]
      ? this.user[client.id].roomId
      : undefined;
    if (roomId) {
      this.handleExitReady(roomId, client);
      await this.socketService.exitRoom(this.user[client.id].id);
      this.roomInfo[roomId] = await this.socketService.getRoom(roomId);
      if (this.roomInfo[roomId] && this.roomInfo[roomId].users.length > 0) {
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

  // 로비 챗
  @SubscribeMessage('lobby.chat')
  async handleLobbyChat(
    @MessageBody() chat: string,
    @ConnectedSocket() client: Socket,
  ) {
    this.server.emit('lobby.chat', { user: this.user[client.id], chat: chat });
  }

  // 게임 방에서 대화
  @SubscribeMessage('chat')
  async handleMessage(
    @MessageBody() { roomId, chat, roundTime, turnTime, score }: Chat,
    @ConnectedSocket() client: Socket,
  ) {
    if (
      this.roomInfo[roomId].start &&
      (this.game[roomId].users[this.game[roomId].turn].id === client.id ||
        this.game[roomId].turn == -1)
    ) {
      switch (this.roomInfo[roomId].type) {
        // 0 is Last, 1 is Kung, 2 is quiz
        case 0:
          await this.handleLastAnswer({
            roomId,
            chat,
            roundTime,
            turnTime,
            score,
          });
          break;
        case 1:
          await this.handleKungAnswer({
            roomId,
            chat,
            roundTime,
            turnTime,
            score,
          });
          break;
        case 2:
          await this.handleWakQuizAnswer({ roomId, chat }, client);
          break;
      }
    } else
      this.server
        .to(roomId)
        .emit('chat', { user: this.user[client.id], chat: chat });
  }

  // 게임 방 생성
  @SubscribeMessage('createRoom')
  async handleCreate(
    @MessageBody() data: CreateRoomDto,
    @ConnectedSocket() client: any,
  ) {
    this.user[client.id] = client.request.session.user;
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

  // 게임 방 수정
  @SubscribeMessage('updateRoom')
  async handleUpdate(
    @MessageBody() { roomId, data }: { roomId: string; data: UpdateRoomDto },
    @ConnectedSocket() client: any,
  ) {
    if (this.game[roomId].host !== this.user[client.id].name) {
      client.emit('alarm', { message: '방장이 아닙니다.' });
      return;
    }
    const roomInfo = await this.socketService.updateRoom(roomId, data);
    this.roomInfo[roomId] = roomInfo;
    this.server.to(roomId).emit('updateRoom', this.roomInfo[roomId]);
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
    this.server.to(roomId).emit('enter', {
      roomInfo: this.roomInfo[roomId],
      game: this.game[roomId],
    });
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
    this.handleExitReady(roomId, client);
    await this.socketService.exitRoom(this.user[client.id].id);
    this.roomInfo[roomId] = await this.socketService.getRoom(roomId);
    client.leave(roomId);
    if (this.roomInfo[roomId].users.length > 0) {
      const { id, name } = this.roomInfo[roomId].users[0];
      this.game[roomId].host = name;
      this.handleHostReady({ roomId, userId: id });
      this.server.to(roomId).emit('exit', {
        roomInfo: this.roomInfo[roomId],
        game: this.game[roomId],
      });
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
    const index = this.game[roomId].users.findIndex((x) => x.id === client.id);
    if (index === -1) {
      this.game[roomId].users.push({
        id: client.id,
        score: 0,
        userId: this.user[client.id].id,
      });
    } else {
      this.game[roomId].users.splice(index, 1);
    }
    this.server.to(roomId).emit('ready', this.game[roomId].users);
  }

  handleExitReady(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (this.game[roomId] && this.game[roomId].users) {
      const index = this.game[roomId].users.findIndex(
        (x) => x.id === client.id,
      );
      if (index === -1) return;
      this.game[roomId].users.splice(index, 1);
    }
  }

  handleHostReady(
    @MessageBody() { roomId, userId }: { roomId: string; userId: string },
  ) {
    if (this.game[roomId] && this.game[roomId].users) {
      const index = this.game[roomId].users.findIndex(
        (x) => x.userId === userId,
      );
      if (index === -1) return;
      this.game[roomId].users.splice(index, 1);
    }
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
   끝말잇기
  */
  @SubscribeMessage('last.start')
  async handleLastStart(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (this.game[roomId].host !== this.user[client.id].name) {
      client.emit('alarm', { message: '방장이 아닙니다.' });
      return;
    }
    if (
      this.game[roomId].users.length + 1 !==
      this.roomInfo[roomId].users.length
    ) {
      client.emit('alarm', { message: '모두 준비상태가 아닙니다.' });
      return;
    }

    this.handleReady(roomId, client);
    this.socketService.shuffle(this.game[roomId]);
    this.game[roomId].option = this.socketService.getOption(
      this.roomInfo[roomId].option,
    );

    await this.lastService.handleStart(
      roomId,
      this.roomInfo[roomId],
      this.game[roomId],
    );
  }

  @SubscribeMessage('last.round')
  async handleLastRound(@MessageBody() roomId: string) {
    await this.lastService.handleRound(
      roomId,
      this.roomInfo[roomId],
      this.game[roomId],
    );
  }

  async handleLastAnswer(
    @MessageBody() { roomId, chat, roundTime, turnTime, score }: Chat,
  ) {
    this.game[roomId].roundTime = roundTime;
    this.game[roomId].turnTime = turnTime;
    const checkLast = this.lastService.handleCheck(
      chat[0],
      this.game[roomId].target as string,
    );

    if (!checkLast.success) {
      this.server.to(roomId).emit('last.game', {
        success: checkLast.success,
        answer: chat,
        game: this.game[roomId],
        message: checkLast.message,
      });
      return;
    }

    const check = await this.socketService.check(
      chat,
      this.game[roomId].option,
    );
    if (check.success) {
      score = this.socketService.checkWakta(check['wakta'])
        ? score * 1.2
        : score;
      this.lastService.handleNextTurn(this.game[roomId], chat, score);
    }
    this.server.to(roomId).emit('last.game', {
      success: check.success,
      answer: chat,
      game: this.game[roomId],
      message: check.message,
    });
  }
  /*
    쿵쿵따
  */

  @SubscribeMessage('kung.start')
  async handleKungStart(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (this.game[roomId].host !== this.user[client.id].name) {
      client.emit('alarm', { message: '방장이 아닙니다.' });
      return;
    }
    if (
      this.game[roomId].users.length + 1 !==
      this.roomInfo[roomId].users.length
    ) {
      client.emit('alarm', { message: '모두 준비상태가 아닙니다.' });
      return;
    }
    this.handleReady(roomId, client);
    this.socketService.shuffle(this.game[roomId]);
    this.game[roomId].option = this.socketService.getOption(
      this.roomInfo[roomId].option,
    );
    await this.kungService.handleStart(
      roomId,
      this.roomInfo[roomId],
      this.game[roomId],
    );
  }

  @SubscribeMessage('kung.round')
  handleKungRound(@MessageBody() roomId: string) {
    this.kungService.handleRound(
      roomId,
      this.roomInfo[roomId],
      this.game[roomId],
    );
  }
  async handleKungAnswer(
    @MessageBody() { roomId, chat, roundTime, turnTime, score }: Chat,
  ) {
    this.game[roomId].roundTime = roundTime;
    this.game[roomId].turnTime = turnTime;
    const checkKung = this.kungService.handleCheck(
      chat[0],
      this.game[roomId].target as string,
      chat.length,
    );
    if (!checkKung.success) {
      this.server.to(roomId).emit('kung.game', {
        success: checkKung.success,
        answer: chat,
        game: this.game[roomId],
        message: checkKung.message,
      });
      return;
    }
    const check = await this.socketService.check(
      chat,
      this.game[roomId].option,
    );
    if (check.success) {
      score = this.socketService.checkWakta(check['wakta'])
        ? score * 1.2
        : score;
      this.kungService.handleNextTurn(this.game[roomId], chat, score);
    }
    this.server.to(roomId).emit('kung.game', {
      success: check.success,
      answer: chat,
      game: this.game[roomId],
      message: check.message,
    });
  }

  @SubscribeMessage('kung.ban')
  handleKungBan(
    @MessageBody() { roomId, keyword }: { roomId: string; keyword: string },
    @ConnectedSocket() client: any,
  ) {
    let index = this.game[roomId].users.indexOf(client.id);
    index += 1;
    index %= this.game[roomId].total;
    this.kungService.handleBan(roomId, index, keyword);
  }

  @SubscribeMessage('wak-quiz.start')
  async handleWakQuizStart(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (this.game[roomId].host !== this.user[client.id].name) {
      client.emit('alarm', { message: '방장이 아닙니다.' });
      return;
    }
    if (
      this.game[roomId].users.length + 1 !==
      this.roomInfo[roomId].users.length
    ) {
      client.emit('alarm', { message: '모두 준비상태가 아닙니다.' });
      return;
    }
    this.handleReady(roomId, client);
    this.socketService.shuffle(this.game[roomId]);
    await this.wakQuizService.handleStart(
      roomId,
      this.roomInfo[roomId],
      this.game[roomId],
    );
  }
  @SubscribeMessage('wak-quiz.round')
  handleWakQuizRound(@MessageBody() roomId: string) {
    this.wakQuizService.handleRound(
      roomId,
      this.roomInfo[roomId],
      this.game[roomId],
    );
  }
  async handleWakQuizAnswer(
    @MessageBody() { roomId, chat }: { roomId: string; chat: string },
    @ConnectedSocket() client: Socket,
  ) {
    const index = this.game[roomId].users.findIndex((x) => x.id === client.id);
    this.wakQuizService.handleAnswer(roomId, index, chat, this.game[roomId]);
  }
}
