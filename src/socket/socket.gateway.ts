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
import { Inject, forwardRef, Logger } from '@nestjs/common';
import { SocketAuthenticatedGuard } from 'src/socket/socket-auth.guard';
import { CreateRoomDto } from 'src/room/dto/create-room.dto';
import { Room } from 'src/room/entities/room.entity';
import { KungService } from 'src/kung/kung.service';
import { LastService } from 'src/last/last.service';
import { UpdateRoomDto } from 'src/room/dto/update-room.dto';
import { BellService } from 'src/bell/bell.service';
import { ConfigService } from '@nestjs/config';

interface Chat {
  roomId: string;
  chat: string;
  roundTime: number | undefined;
  score: number | undefined;
  success?: boolean;
}

interface Emoticon {
  emoticonId: string;
  userId: string;
  roomId: string;
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
    this.turnChanged = false;
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
  turnChanged: boolean;
}

@WebSocketGateway({
  namespace: 'wakttu',
  cors: { origin: true, credentials: true },
  transports: ['websocket'],
  pingInterval: 10000,
  pingTimeout: 5000,
  upgradeTimeout: 10000,
  maxHttpBufferSize: 1e6,
})
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(SocketGateway.name);
  private readonly MAX_CONNECTIONS = 50; // 최대 연결 수 설정
  private currentConnections = 0; // 현재 연결된 소켓 수

  constructor(
    @Inject(forwardRef(() => LastService))
    private readonly lastService: LastService,
    @Inject(forwardRef(() => KungService))
    private readonly kungService: KungService,
    @Inject(forwardRef(() => BellService))
    private readonly bellService: BellService,
    private readonly socketService: SocketService,
    private readonly guard: SocketAuthenticatedGuard,
    private readonly config: ConfigService,
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

  async handleConnection(@ConnectedSocket() client: any) {
    try {
      const isAuthenticated = await this.guard.validateClient(client);

      if (!isAuthenticated) {
        client.disconnect();
        return;
      }

      this.currentConnections++; // 연결 수 증가

      // 최대 연결 수 확인
      if (this.currentConnections > this.MAX_CONNECTIONS) {
        this.logger.warn(
          `Connection rejected - Max connections reached: ${client.id}`,
        );
        client.emit('full', {
          message: '서버가 가득 찼습니다. 잠시 후 다시 시도해주세요.',
        });
        setTimeout(() => client.disconnect(), 200);
        return;
      }

      const user = client.request.session?.user;
      if (!user) {
        this.logger.warn(`Connection rejected - No user session: ${client.id}`);
        client.disconnect();
        return;
      }

      // 중복 접속 확인 및 처리
      const existingClientId = Object.keys(this.user).find(
        (key) => this.user[key].id === user.id,
      );
      if (existingClientId) {
        this.server
          .to(existingClientId)
          .emit('alarm', { message: '이미 접속중인 유저입니다!' });
        this.handleDisconnect({ id: existingClientId });
      }

      this.user[client.id] = await this.socketService.reloadUser(user.id);
      this.user[client.id].color = this.socketService.getColor();

      client.emit('connected'); // 필요한 정보만 전달
      this.logger.log(`Client connected: ${client.id}`);
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`, error.stack);
      client.emit('error', { message: '서버 오류가 발생했습니다.' });
    }
  }

  // 소켓서버가 열릴시 수행되는 코드
  async afterInit() {
    // 다시열릴시 존재하는 방 모두 삭제
    const ENV = this.config.get<string>('NODE_ENV');
    if (ENV !== 'development') await this.socketService.deleteAllRoom();
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
    try {
      this.currentConnections--; // 연결 수 감소
      const roomId = this.user[client.id]
        ? this.user[client.id].roomId
        : undefined;

      if (roomId) {
        this.logger.log(
          `Client disconnecting from room ${roomId}: ${client.id}`,
        );

        this.handleExitReady(roomId, client);
        if (this.game[roomId]) this.handleExitTeam(roomId, client);
        await this.socketService.exitRoom(this.user[client.id].id);

        this.roomInfo[roomId] = await this.socketService.getRoom(roomId);
        if (this.roomInfo[roomId] && this.roomInfo[roomId].users.length > 0) {
          const { id } = this.roomInfo[roomId].users[0];

          if (this.game[roomId].host === this.user[client.id].id) {
            this.game[roomId].host = id;
          }

          if (!this.roomInfo[roomId].start) {
            this.handleHostReady({ roomId, id });
          }

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

      if (this.user[client.id] && this.user[client.id].provider === 'guest') {
        await this.socketService.deleteGuest(this.user[client.id].id);
        client.request.session.destroy(() => {});
      }

      delete this.user[client.id];
      this.server.emit('list', this.user);

      this.logger.log(`Client disconnected successfully: ${client.id}`);
    } catch (error) {
      this.logger.error(
        `Disconnect error for client ${client.id}: ${error.message}`,
        error.stack,
      );
      try {
        this.currentConnections--; // 에러가 발생해도 연결 수는 감소
        delete this.user[client.id];
        this.server.emit('list', this.user);
      } catch (cleanupError) {
        this.logger.error(
          `Additional cleanup error: ${cleanupError.message}`,
          cleanupError.stack,
        );
      }
    }
  }

  // ping
  @SubscribeMessage('ping')
  handlePing(@MessageBody() roomId: string) {
    this.game[roomId].turnChanged = false;
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
    this.server.emit('lobby.chat', {
      user: this.user[client.id],
      chat: chat,
    });
  }

  // 게임 방에서 대화
  @SubscribeMessage('chat')
  async handleMessage(
    @MessageBody() { roomId, chat, roundTime, score, success }: Chat,
    @ConnectedSocket() client: Socket,
  ) {
    const isGameTurn =
      this.roomInfo[roomId].start &&
      (this.game[roomId].turn === -1 ||
        this.game[roomId].users[this.game[roomId].turn].id === client.id);

    if (!isGameTurn || roundTime === null) {
      return this.server
        .to(roomId)
        .emit('chat', { user: this.user[client.id], chat });
    }

    if (!this.ping[roomId]) {
      return this.server
        .to(roomId)
        .emit('chat', { user: this.user[client.id], chat });
    }

    this.game[roomId].loading = true;
    await this.handleGameMessage(
      roomId,
      { chat, roundTime, score, success },
      client,
    );
  }

  private async handleGameMessage(
    roomId: string,
    messageData: Omit<Chat, 'roomId'>,
    client: Socket,
  ) {
    const { chat, roundTime, score, success } = messageData;
    const gameType = this.roomInfo[roomId].type;

    try {
      this.logger.debug(
        `Processing game message - Room: ${roomId}, Type: ${gameType}`,
      );

      switch (gameType) {
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
        case 2:
          this.handleBellAnswer({ roomId, score }, client);
          break;
      }
    } catch (error) {
      this.logger.error(
        `Game message error - Room: ${roomId}, Type: ${gameType}`,
        error.stack,
      );
      // 에러 처리 로직 추가
    } finally {
      this.game[roomId].loading = false;
    }
  }

  // Emoticon
  @SubscribeMessage('emoticon')
  handleEmoticon(@MessageBody() data: Emoticon) {
    console.log('emoticon');
    this.server.to(data.roomId).emit('emoticon', data);
  }

  // 게임 방 생성
  @SubscribeMessage('createRoom')
  async handleCreate(
    @MessageBody() data: CreateRoomDto,
    @ConnectedSocket() client: any,
  ) {
    try {
      this.logger.log(`Creating room - User: ${client.id}`);
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
    } catch (error) {
      this.logger.error(`Room creation error: ${error.message}`, error.stack);
      throw error;
    }
  }

  // 게임 방 수정
  @SubscribeMessage('updateRoom')
  async handleUpdate(
    @MessageBody() { roomId, data }: { roomId: string; data: UpdateRoomDto },
    @ConnectedSocket() client: any,
  ) {
    try {
      if (this.game[roomId].host !== this.user[client.id].id) {
        client.emit('alarm', { message: '방장이 아닙니다.' });
        return;
      }
      const roomInfo = await this.socketService.updateRoom(roomId, data);
      this.roomInfo[roomId] = roomInfo;
      this.game[roomId].users = [];
      this.game[roomId].team = {
        woo: [],
        gomem: [],
        academy: [],
        isedol: [],
      };
      this.server.to(roomId).emit('updateRoom', {
        roomInfo: this.roomInfo[roomId],
        game: this.game[roomId],
      });
    } catch (error) {
      this.logger.error(`Room update error: ${error.message}`, error.stack);
      client.emit('alarm', {
        message: '방 업데이트 중 오류가 발생했습니다.',
      });
    }
  }

  // 게임 방 입장
  @SubscribeMessage('enter')
  async handleEnter(
    @MessageBody() { roomId, password }: { roomId: string; password: string },
    @ConnectedSocket() client: any,
  ) {
    try {
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
        client.emit('alarm', {
          message: '추방 당한 유저는 접속이 불가능 해요!',
        });
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
    } catch (error) {
      this.logger.error(`Room enter error: ${error.message}`, error.stack);
      client.emit('alarm', { message: '방 입장 중 오류가 발생했습니다.' });
    }
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
    const teams = ['woo', 'gomem', 'academy', 'isedol'] as const;
    const userId = this.user[client.id].id;

    // 모든 팀에서 유저 제거
    teams.forEach((teamName) => {
      const index = this.game[roomId].team[teamName].indexOf(userId);
      if (index !== -1) {
        this.game[roomId].team[teamName].splice(index, 1);
      }
    });

    // 새로운 팀에 유저 추가
    this.game[roomId].team[team].push(userId);
    this.user[client.id].team = team;

    this.server.to(roomId).emit('team', this.game[roomId]);
  }

  handleExitTeam(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const teams = ['woo', 'gomem', 'academy', 'isedol'] as const;

    // 모든 팀에서 유저 제거
    teams.forEach((team) => {
      const userIndex = this.game[roomId].team[team].findIndex(
        (userId) => userId === this.user[client.id].id,
      );
      if (userIndex !== -1) {
        this.game[roomId].team[team].splice(userIndex, 1);
      }
    });
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
    try {
      const roomInfo = await this.socketService.setStart(roomId, true);
      this.game[roomId].users = [];
      this.server
        .to(roomId)
        .emit('start', { roomInfo, game: this.game[roomId] });
    } catch (error) {
      this.logger.error(`Start game error - Room: ${roomId}`, error.stack);
      this.server
        .to(roomId)
        .emit('alarm', { message: '게임 시작 중 오류가 발생했습니다.' });
    }
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
    try {
      this.logger.log(`Starting last word game - Room: ${roomId}`);
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
        this.socketService.teamShuffle(
          this.game[roomId],
          this.game[roomId].team,
        );
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
    } catch (error) {
      this.logger.error(`Game start error - Room: ${roomId}`, error.stack);
      client.emit('alarm', { message: '게임 시작 중 오류가 발생했습니다.' });
    }
  }

  @SubscribeMessage('last.round')
  async handleLastRound(@MessageBody() roomId: string) {
    try {
      await this.lastService.handleRound(
        roomId,
        this.roomInfo[roomId],
        this.game[roomId],
      );
    } catch (error) {
      this.logger.error(`Last word round error: ${error.message}`, error.stack);
      this.server
        .to(roomId)
        .emit('alarm', { message: '라운드 진행 중 오류가 발생했습니다.' });
    }
  }

  @SubscribeMessage('last.turnStart')
  async handleTurnStart(@MessageBody() roomId: string) {
    this.server.to(roomId).emit('last.turnStart');
  }

  @SubscribeMessage('last.turnEnd')
  async handleTurnEnd(@MessageBody() roomId: string) {
    if (this.game[roomId].loading) {
      setTimeout(() => this.handleTurnEnd(roomId), 100);
      return;
    }

    if (!this.ping[roomId] && !this.game[roomId].turnChanged) {
      await this.lastService.handleTurnEnd(this.game[roomId]);
      this.server.to(roomId).emit('last.turnEnd', this.game[roomId]);
    }

    this.game[roomId].turnChanged = false;
  }

  async handleLastAnswer(
    @MessageBody() { roomId, chat, roundTime, score, success }: Chat,
  ) {
    this.game[roomId].roundTime = roundTime;
    this.game[roomId].turnTime = this.socketService.getTurnTime(
      roundTime,
      this.game[roomId].chain,
    );
    const who = this.game[roomId].users[this.game[roomId].turn].userId;
    if (success) {
      this.server.to(roomId).emit('last.game', {
        success: false,
        answer: chat,
        game: this.game[roomId],
        message: '5',
        word: undefined,
        who,
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
        this.game[roomId].turnChanged = true;
      }
      this.server.to(roomId).emit('last.game', {
        success: check.success,
        answer: chat,
        game: this.game[roomId],
        message: check.message,
        word: check.word,
        who,
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
    try {
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
    } catch (error) {
      this.logger.error(`Kung game start error: ${error.message}`, error.stack);
      client.emit('alarm', { message: '게임 시작 중 오류가 발생했습니다.' });
    }
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
    const who = this.game[roomId].users[this.game[roomId].turn].userId;
    if (success) {
      this.server.to(roomId).emit('kung.game', {
        success: false,
        answer: chat,
        game: this.game[roomId],
        message: '5',
        word: undefined,
        who,
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
        this.game[roomId].turnChanged = true;
      }
      this.server.to(roomId).emit('kung.game', {
        success: check.success,
        answer: chat,
        game: this.game[roomId],
        message: check.message,
        word: check.word,
        who,
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

    if (!this.ping[roomId] && !this.game[roomId].turnChanged) {
      this.kungService.handleTurnEnd(this.game[roomId]);
      this.server.to(roomId).emit('kung.turnEnd', this.game[roomId]);
    }

    this.game[roomId].turnChanged = false;
  }

  /*
   * 골든벨 (자음퀴즈)
   */

  @SubscribeMessage('bell.start')
  async handleBellStart(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    try {
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
    } catch (error) {
      this.logger.error(`Bell game start error: ${error.message}`, error.stack);
      client.emit('alarm', { message: '게임 시작 중 오류 발생했습니다.' });
    }
  }

  @SubscribeMessage('bell.round')
  async handleBellRound(@MessageBody() roomId: string) {
    try {
      await this.bellService.handleRound(
        roomId,
        this.roomInfo[roomId],
        this.game[roomId],
      );
    } catch (error) {
      this.logger.error(`Bell round error: ${error.message}`, error.stack);
      this.server
        .to(roomId)
        .emit('alarm', { message: '라운드 진행 중 오류가 발생했습니다.' });
    }
  }

  // ping
  @SubscribeMessage('bell.ping')
  handleBellPing(@MessageBody() roomId: string) {
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
    delete this.ping[roomId];
    this.server.to(roomId).emit('bell.pong');
  }

  @SubscribeMessage('bell.roundStart')
  handleBellRoundStart(@MessageBody() roomId: string) {
    this.server.to(roomId).emit('bell.roundStart');
  }

  @SubscribeMessage('bell.roundEnd')
  handleBellRoundEnd(@MessageBody() roomId: string) {
    try {
      if (!this.game[roomId]) {
        this.logger.warn(`Room ${roomId} not found in bell.roundEnd`);
        return;
      }

      this.game[roomId].users.forEach((user) => {
        if (!user.success) user.success = false;
      });
      this.server.to(roomId).emit('bell.roundEnd', this.game[roomId]);
    } catch (error) {
      this.logger.error(`Bell round end error: ${error.message}`, error.stack);
      this.server
        .to(roomId)
        .emit('alarm', { message: '라운드 종료 중 오류가 발생했습니다.' });
    }
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
    try {
      if (!this.game[roomId]) {
        this.logger.warn(`Room ${roomId} not found in bell.answer`);
        return;
      }

      const idx = this.game[roomId].users.findIndex(
        (user) => user.userId === this.user[client.id].id,
      );
      if (idx === -1) {
        this.logger.warn(`User not found in room ${roomId}`);
        return;
      }

      this.bellService.handleAnswer(idx, this.game[roomId], score);
      const count = this.game[roomId].users.filter(
        (user) => user.success === true,
      );

      if (count.length === this.game[roomId].users.length) {
        this.handleBellPong(roomId);
      }
      this.server.to(roomId).emit('bell.game', this.game[roomId]);
    } catch (error) {
      this.logger.error(`Bell answer error: ${error.message}`, error.stack);
      this.server
        .to(roomId)
        .emit('alarm', { message: '답변 처리 중 오류가 발생했습니다.' });
    }
  }
}
