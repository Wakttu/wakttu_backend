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
import { UpdateRoomDto } from 'src/room/dto/update-room.dto';
import { BellService } from 'src/bell/bell.service';

interface Chat {
  roomId: string;
  chat: string;
  roundTime: number | undefined;
  score: number | undefined;
  success?: boolean;
}

export class Game {
  constructor() {
    this.host = ''; // 호스트
    this.round = 0; // 현재 라운드
    this.turn = -1; // 현재 누구의 턴인지 자리 index 값
    this.users = []; // 유저들의 정보가 들어있는 칸 위의 turn과 index를 같이사용
    this.chain = 0; // 현재 몇 체인인지 보여주는 정보
    this.roundTime = 60000; // 라운드 남은 시간 처음시작 60초
    this.turnTime = 20000; // 턴 남은 시간 처음시작 20초
    this.team = {
      woo: [],
      gomem: [],
      academy: [],
      isedol: [],
    };
    this.ban = [];
    this.loading = false;
  }
  host: string; // 호스트
  type: number; // 게임종류 0:끝말잇기 1:쿵쿵따 2:왁타버스 퀴즈
  round: number; // 현재 라운드
  turn: number; // 현재 누구의 턴인가 보여주는 index
  total: number; // 총인원수
  users: {
    id: string;
    score: number;
    userId: string;
    character: JSON;
    name: string;
    team?: string;
    success?: boolean;
    exp: number;
    provider?: string;
  }[]; // user의 socketId 정보가 들어가있음. 점수정보포함
  keyword: string | undefined; // 바탕단어 (이세계아이돌)
  target: string; // 현재 게임 진행에서 사용될 단어 (세)
  option: boolean[] | undefined; // [매너,품어,외수] 설정이 되어있을때 true,false로 확인 가능
  chain: number; // 현재 체인정보
  roundTime: number; // 남은 라운드시간 정보
  turnTime: number;
  mission: string | undefined; // 끝말잇기에서 사용될 미션단어
  ban: string[]; //
  team: {
    woo: string[];
    gomem: string[];
    academy: string[];
    isedol: string[];
  };
  quiz?: {
    _id: string;
    type: string;
    [x: string]: any;
    choseong: string;
    hint: string[];
  }[];
  loading?: boolean;
}

@UseGuards(SocketAuthenticatedGuard)
@WebSocketGateway({
  namespace: 'wakttu',
  cors: { origin: true, credentials: true },
  transports: ['websocket'],
})
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @Inject(forwardRef(() => LastService))
    private readonly lastService: LastService,
    @Inject(forwardRef(() => KungService))
    private readonly kungService: KungService,
    @Inject(forwardRef(() => BellService))
    private readonly bellService: BellService,
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

  public ping: {
    [roomId: string]: NodeJS.Timeout;
  } = {};

  // 접속시 수행되는 코드
  async handleConnection(@ConnectedSocket() client: any) {
    const user = client.request.session.user;
    if (!user) {
      client.disconnect();
      return;
    }
    for (const key in this.user) {
      if (this.user[key].id === user.id) {
        this.server
          .to(key)
          .emit('alarm', { message: '이미 접속중인 유저입니다!' });
        this.handleDisconnect({ id: key });
      }
    }
    this.user[client.id] = await this.socketService.reloadUser(user.id);
    this.user[client.id].color = this.socketService.getColor();
    this.server.emit('list', this.user);
  }

  // 소켓서버가 열릴시 수행되는 코드
  async afterInit() {
    // 다시열릴시 존재하는 방 모두 삭제
    await this.socketService.deleteAllRoom();
    this.user = {};
    this.game = {};
    // 서버를 service와 연결
    this.lastService.server = this.server;
    this.kungService.server = this.server;
    this.bellService.server = this.server;
    console.log('socket is open!');
  }

  // 소켓연결이 끊어지면 속해있는 방에서 나가게 하는 코드
  async handleDisconnect(client: any) {
    const roomId = this.user[client.id]
      ? this.user[client.id].roomId
      : undefined;
    if (roomId) {
      this.handleExitReady(roomId, client);
      if (this.game[roomId]) this.handleExitTeam(roomId, client);
      await this.socketService.exitRoom(this.user[client.id].id);

      this.roomInfo[roomId] = await this.socketService.getRoom(roomId);
      if (this.roomInfo[roomId] && this.roomInfo[roomId].users.length > 0) {
        const { id } = this.roomInfo[roomId].users[0];

        if (this.game[roomId].host === this.user[client.id].id)
          this.game[roomId].host = id;

        if (!this.roomInfo[roomId].start) this.handleHostReady({ roomId, id });

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
    delete this.user[client.id];
    this.server.emit('list', this.user);
  }

  // ping
  @SubscribeMessage('ping')
  handlePing(@MessageBody() roomId: string) {
    let time = this.game[roomId].turnTime / 100;
    const timeId = setInterval(() => {
      this.server.to(roomId).emit('ping');
      time--;
      if (time === 0) {
        this.handlePong(roomId);
        this.server.to(roomId).emit('pong');
      }
    }, 100);
    this.ping[roomId] = timeId;
  }

  // pong
  @SubscribeMessage('pong')
  handlePong(@MessageBody() roomId) {
    clearInterval(this.ping[roomId]);
    delete this.ping[roomId];
  }

  // user List
  @SubscribeMessage('list')
  handleUserList(@ConnectedSocket() client: Socket) {
    client.emit('list', this.user);
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
    @MessageBody() { roomId, chat, roundTime, score, success }: Chat,
    @ConnectedSocket() client: Socket,
  ) {
    if (
      this.roomInfo[roomId].start &&
      (this.game[roomId].turn === -1 ||
        this.game[roomId].users[this.game[roomId].turn].id === client.id) &&
      roundTime !== null
    ) {
      if (!this.ping[roomId]) {
        this.server
          .to(roomId)
          .emit('chat', { user: this.user[client.id], chat: chat });
        return;
      }

      this.game[roomId].loading = true;
      switch (this.roomInfo[roomId].type) {
        // 0 is Last, 1 is Kung, 2 is quiz
        case 0:
          await this.handleLastAnswer({
            roomId,
            chat,
            roundTime,
            score,
            success,
          });
          break;
        case 1:
          await this.handleKungAnswer({
            roomId,
            chat,
            roundTime,
            score,
            success,
          });
          break;
        case 2: {
          this.handleBellAnswer({ roomId, score }, client);
          break;
        }
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
    this.game[room.id].host = this.user[client.id].id;
    client.emit('createRoom', { roomId: room.id, password });
  }

  // 게임 방 수정
  @SubscribeMessage('updateRoom')
  async handleUpdate(
    @MessageBody() { roomId, data }: { roomId: string; data: UpdateRoomDto },
    @ConnectedSocket() client: any,
  ) {
    if (this.game[roomId].host !== this.user[client.id].id) {
      client.emit('alarm', { message: '방장이 아닙니다.' });
      return;
    }
    const roomInfo = await this.socketService.updateRoom(roomId, data);
    this.roomInfo[roomId] = roomInfo;
    this.game[roomId].users = [];
    this.game[roomId].team = { woo: [], gomem: [], academy: [], isedol: [] };
    this.server.to(roomId).emit('updateRoom', {
      roomInfo: this.roomInfo[roomId],
      game: this.game[roomId],
    });
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
    if (!this.user[client.id]) {
      const user = client.request.session.user;
      if (!user) {
        client.emit('alarm', {
          message: '계정에 오류가 있습니다. 새로고침 후 재접속하세요!',
        });
        return;
      }
      this.user[client.id] = user;
    }
    if (!this.roomInfo[roomId]) {
      client.emit('alarm', { message: '존재하지 않는 방입니다.' });
      return;
    }

    if (this.roomInfo[roomId].total === this.roomInfo[roomId].users.length) {
      client.emit('alarm', { message: '인원이 가득찼습니다!' });
      return;
    }

    if (this.game[roomId].ban.includes(this.user[client.id].id)) {
      client.emit('alarm', { message: '추방 당한 유저는 접속이 불가능 해요!' });
      return;
    }
    const check = await this.socketService.checkPassword(roomId, password);
    if (!check) {
      client.emit('alarm', { message: '유효하지 않은 패스워드 입니다.' });
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
    this.handleMessage(
      {
        roomId,
        chat: '님이 입장하였습니다.',
        score: 0,
        roundTime: null,
      },
      client,
    );
  }

  // 게임방 퇴장
  @SubscribeMessage('exit')
  async handleExit(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (!client.rooms.has(roomId) || !this.roomInfo[roomId]) {
      return;
    }
    this.handleExitReady(roomId, client);
    if (this.game[roomId]) this.handleExitTeam(roomId, client);
    await this.socketService.exitRoom(this.user[client.id].id);
    this.roomInfo[roomId] = await this.socketService.getRoom(roomId);
    client.leave(roomId);
    if (this.roomInfo[roomId].users.length > 0) {
      const { id } = this.roomInfo[roomId].users[0];
      if (this.game[roomId].host === this.user[client.id].id)
        this.game[roomId].host = id;

      if (!this.roomInfo[roomId].start) this.handleHostReady({ roomId, id });
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
    if (!this.roomInfo[roomId] || !this.game[roomId]) return;

    if (this.user[client.id].id !== this.game[roomId].host) {
      return;
    }
    const key = Object.keys(this.user).find(
      (key) => this.user[key].id === userId,
    );
    this.game[roomId].ban.push(this.user[key].id);

    client.to(key).emit('kick helper', { socketId: key });
  }

  @SubscribeMessage('kick helper')
  async hanldeKickHelper(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    await this.handleExit(roomId, client);
    client.emit('alarm', { message: '퇴장 당하셨습니다.' });
  }

  // host 넘기기
  @SubscribeMessage('host')
  handleChangeHost(
    @MessageBody() { roomId, userId }: { roomId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (!this.roomInfo[roomId] || !this.game[roomId]) return;

    if (this.user[client.id].id !== this.game[roomId].host) {
      return;
    }
    const key = Object.keys(this.user).find(
      (key) => this.user[key].id === userId,
    );

    this.game[roomId].host = this.user[key].id;
    this.game[roomId].users = [];
    this.game[roomId].team = {
      woo: [],
      gomem: [],
      academy: [],
      isedol: [],
    };
    client.to(key).emit('alarm', { message: '방장이 되었습니다!' });
    this.server.to(roomId).emit('host', this.game[roomId]);
  }

  // 유저들의 팀선 택
  @SubscribeMessage('team')
  handleTeam(
    @MessageBody()
    { roomId, team }: { roomId: string; team: string },
    @ConnectedSocket() client: Socket,
  ) {
    const InWoo = this.game[roomId].team['woo'].findIndex(
      (user) => user === this.user[client.id].id,
    );

    const InGomem = this.game[roomId].team['gomem'].findIndex(
      (user) => user === this.user[client.id].id,
    );

    const InAcademy = this.game[roomId].team['academy'].findIndex(
      (user) => user === this.user[client.id].id,
    );

    const InIsedol = this.game[roomId].team['isedol'].findIndex(
      (user) => user === this.user[client.id].id,
    );

    if (InWoo !== -1) this.game[roomId].team['woo'].splice(InWoo, 1);

    if (InGomem !== -1) this.game[roomId].team['gomem'].splice(InGomem, 1);

    if (InAcademy !== -1)
      this.game[roomId].team['academy'].splice(InAcademy, 1);

    if (InIsedol !== -1) this.game[roomId].team['isedol'].splice(InIsedol, 1);

    this.game[roomId].team[team].push(this.user[client.id].id);
    this.user[client.id].team = team;
    this.server.to(roomId).emit('team', this.game[roomId]);
  }

  handleExitTeam(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const InWoo = this.game[roomId].team['woo'].findIndex(
      (user) => user === this.user[client.id].id,
    );

    const InGomem = this.game[roomId].team['gomem'].findIndex(
      (user) => user === this.user[client.id].id,
    );

    const InAcademy = this.game[roomId].team['academy'].findIndex(
      (user) => user === this.user[client.id].id,
    );

    const InIsedol = this.game[roomId].team['isedol'].findIndex(
      (user) => user === this.user[client.id].id,
    );

    if (InWoo !== -1) this.game[roomId].team['woo'].splice(InWoo, 1);

    if (InGomem !== -1) this.game[roomId].team['gomem'].splice(InGomem, 1);

    if (InAcademy !== -1)
      this.game[roomId].team['academy'].splice(InAcademy, 1);

    if (InIsedol !== -1) this.game[roomId].team['isedol'].splice(InIsedol, 1);
  }

  // 유저들의 ready 확인
  @SubscribeMessage('ready')
  handleReady(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (!this.game[roomId]) return;
    const index = this.game[roomId].users.findIndex((x) => x.id === client.id);
    if (index === -1) {
      const user = this.roomInfo[roomId].users.find(
        (user) => user.id === this.user[client.id].id,
      );
      this.game[roomId].users.push({
        id: client.id,
        score: 0,
        userId: this.user[client.id].id,
        character: user.character,
        name: user.name,
        team:
          this.user[client.id].team &&
          this.roomInfo[roomId].option.includes('팀전')
            ? this.user[client.id].team
            : undefined,
        exp: this.user[client.id].score,
        provider: this.user[client.id].provider,
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

      this.game[roomId].total = this.game[roomId].users.length;
      this.game[roomId].turn = this.game[roomId].turn % this.game[roomId].total;
    }
  }

  handleHostReady(
    @MessageBody() { roomId, id }: { roomId: string; id: string },
  ) {
    if (this.game[roomId] && this.game[roomId].users) {
      const index = this.game[roomId].users.findIndex((x) => x.userId === id);
      if (index === -1) return;
      this.game[roomId].users.splice(index, 1);
    }
  }

  // room Strart 풀기
  @SubscribeMessage('start')
  async handleStart(@MessageBody() roomId: string) {
    const roomInfo = await this.socketService.setStart(roomId, true);
    this.game[roomId].users = [];
    this.server.to(roomId).emit('start', { roomInfo, game: this.game[roomId] });
  }

  // Get 변수
  @SubscribeMessage('info')
  async handleInfo(@ConnectedSocket() client: Socket) {
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
    if (this.game[roomId].host !== this.user[client.id].id) {
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

    if (this.roomInfo[roomId].option.includes('팀전'))
      this.socketService.teamShuffle(this.game[roomId], this.game[roomId].team);
    else this.socketService.shuffle(this.game[roomId]);

    this.game[roomId].option = this.socketService.getOption(
      this.roomInfo[roomId].option,
    );
    this.game[roomId].roundTime = this.roomInfo[roomId].time;

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

  @SubscribeMessage('last.turnStart')
  async handleTurnStart(@MessageBody() roomId: string) {
    this.server.to(roomId).emit('last.turnStart');
  }

  @SubscribeMessage('last.turnEnd')
  handleTurnEnd(@MessageBody() roomId: string) {
    if (this.game[roomId].loading) {
      setTimeout(() => this.handleTurnEnd(roomId), 100);
      return;
    }
    if (!this.ping[roomId]) {
      this.lastService.handleTurnEnd(this.game[roomId]);
      this.server.to(roomId).emit('last.turnEnd', this.game[roomId]);
    }
  }

  async handleLastAnswer(
    @MessageBody() { roomId, chat, roundTime, score, success }: Chat,
  ) {
    this.game[roomId].roundTime = roundTime;
    this.game[roomId].turnTime = this.socketService.getTurnTime(
      roundTime,
      this.game[roomId].chain,
    );
    if (success) {
      this.server.to(roomId).emit('last.game', {
        success: false,
        answer: chat,
        game: this.game[roomId],
        message: '5',
        word: undefined,
      });
    } else {
      const check = await this.socketService.check(
        chat,
        this.game[roomId].option,
      );
      if (check.success) {
        score = this.socketService.checkWakta(check.word.wakta)
          ? score * 1.58
          : score;
        const mission = await this.lastService.handleCheckMission(
          chat,
          this.game[roomId],
        );
        score = mission ? score * 1.2 : score;
        score = Math.round(score);
        this.lastService.handleNextTurn(this.game[roomId], chat, score);
        this.handlePong(roomId);
      }
      this.server.to(roomId).emit('last.game', {
        success: check.success,
        answer: chat,
        game: this.game[roomId],
        message: check.message,
        word: check.word,
      });
    }
    this.game[roomId].loading = false;
  }

  /*
    쿵쿵따
  */

  @SubscribeMessage('kung.start')
  async handleKungStart(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (this.game[roomId].host !== this.user[client.id].id) {
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
    @MessageBody() { roomId, chat, roundTime, score, success }: Chat,
  ) {
    this.game[roomId].roundTime = roundTime;
    this.game[roomId].turnTime = this.socketService.getTurnTime(
      roundTime,
      this.game[roomId].chain,
    );
    if (success) {
      this.server.to(roomId).emit('kung.game', {
        success: false,
        answer: chat,
        game: this.game[roomId],
        message: '5',
        word: undefined,
      });
    } else {
      const check = await this.socketService.check(
        chat,
        this.game[roomId].option,
      );
      if (check.success) {
        score = this.socketService.checkWakta(check['wakta'])
          ? score * 1.58
          : score;
        score = Math.round(score);
        this.kungService.handleNextTurn(this.game[roomId], chat, score);
        this.handlePong(roomId);
      }
      this.server.to(roomId).emit('kung.game', {
        success: check.success,
        answer: chat,
        game: this.game[roomId],
        message: check.message,
        word: check.word,
      });
    }
    this.game[roomId].loading = false;
  }

  @SubscribeMessage('kung.turnStart')
  async handleKTurnStart(@MessageBody() roomId: string) {
    this.server.to(roomId).emit('kung.turnStart');
  }

  @SubscribeMessage('kung.turnEnd')
  handleKTurnEnd(@MessageBody() roomId: string) {
    if (this.game[roomId].loading) {
      setTimeout(() => this.handleKTurnEnd(roomId), 100);
      return;
    }
    this.kungService.handleTurnEnd(this.game[roomId]);
    this.server.to(roomId).emit('kung.turnEnd', this.game[roomId]);
  }

  /*
   * 골든벨 (자음퀴즈)
   */

  @SubscribeMessage('bell.start')
  async handleBellStart(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (this.game[roomId].host !== this.user[client.id].id) {
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

    await this.bellService.handleStart(
      roomId,
      this.roomInfo[roomId],
      this.game[roomId],
    );
  }

  @SubscribeMessage('bell.round')
  async handleBellRound(@MessageBody() roomId: string) {
    await this.bellService.handleRound(
      roomId,
      this.roomInfo[roomId],
      this.game[roomId],
    );
  }

  // ping
  @SubscribeMessage('bell.ping')
  handleBellPing(@MessageBody() roomId: string) {
    if (this.ping[roomId]) this.handleBellPong(roomId);
    let time = 300;
    const timeId = setInterval(() => {
      this.server.to(roomId).emit('bell.ping');
      time--;
      if (time === 0) {
        this.handleBellPong(roomId);
      }
    }, 100);
    this.ping[roomId] = timeId;
  }

  // pong
  @SubscribeMessage('bell.pong')
  handleBellPong(@MessageBody() roomId) {
    clearInterval(this.ping[roomId]);
  }

  @SubscribeMessage('bell.roundStart')
  handleBellRoundStart(@MessageBody() roomId: string) {
    this.server.to(roomId).emit('bell.roundStart');
  }

  @SubscribeMessage('bell.roundEnd')
  handleBellRoundEnd(@MessageBody() roomId: string) {
    this.handleBellPong(roomId);
    this.game[roomId].users.forEach((user) => {
      if (!user.success) user.success = false;
    });
    this.server.to(roomId).emit('bell.roundEnd', this.game[roomId]);
  }

  @SubscribeMessage('bell.answer')
  handleBellAnswer(
    @MessageBody()
    {
      roomId,
      score,
    }: {
      roomId: string;
      score: number;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const idx = this.game[roomId].users.findIndex(
      (user) => user.userId === this.user[client.id].id,
    );
    if (idx === -1) return;

    this.bellService.handleAnswer(idx, this.game[roomId], score);
    this.server.to(roomId).emit('bell.game', this.game[roomId]);
  }
}
