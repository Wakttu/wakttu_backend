'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
<<<<<<< HEAD
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
var __param =
  (this && this.__param) ||
  function (paramIndex, decorator) {
    return function (target, key) {
      decorator(target, key, paramIndex);
    };
  };
var SocketGateway_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.SocketGateway = exports.Game = void 0;
const websockets_1 = require('@nestjs/websockets');
const socket_io_1 = require('socket.io');
const socket_service_1 = require('./socket.service');
const common_1 = require('@nestjs/common');
const socket_auth_guard_1 = require('./socket-auth.guard');
const create_room_dto_1 = require('../room/dto/create-room.dto');
const kung_service_1 = require('../kung/kung.service');
const last_service_1 = require('../last/last.service');
const bell_service_1 = require('../bell/bell.service');
const config_1 = require('@nestjs/config');
class Game {
  constructor() {
    this.host = '';
    this.round = 0;
    this.turn = -1;
    this.users = [];
    this.chain = 0;
    this.roundTime = 60000;
    this.turnTime = 20000;
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
}
exports.Game = Game;
let SocketGateway = (SocketGateway_1 = class SocketGateway {
  constructor(
    lastService,
    kungService,
    bellService,
    socketService,
    guard,
    config,
  ) {
    this.lastService = lastService;
    this.kungService = kungService;
    this.bellService = bellService;
    this.socketService = socketService;
    this.guard = guard;
    this.config = config;
    this.logger = new common_1.Logger(SocketGateway_1.name);
    this.MAX_CONNECTIONS = 200;
    this.currentConnections = 0;
    this.user = {};
    this.roomInfo = {};
    this.game = {};
    this.ping = {};
  }
  async handleConnection(client) {
    try {
      const isAuthenticated = await this.guard.validateClient(client);
      if (!isAuthenticated) {
        client.disconnect();
        return;
      }
      if (this.currentConnections >= this.MAX_CONNECTIONS) {
        this.logger.warn(
          `Connection rejected - Max connections reached: ${client.id}`,
        );
        client.emit('full', {
          message: '서버가 가득 찼습니다. 잠시 후 다시 시도해주세요.',
        });
        client.disconnect();
        return;
      }
      const user = client.request.session.user;
      this.logger.log(`Client connected: ${client.id}`);
      if (!user) {
        this.logger.warn(`Connection rejected - No user session: ${client.id}`);
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
      this.currentConnections++;
      this.user[client.id] = await this.socketService.reloadUser(user.id);
      this.user[client.id].color = this.socketService.getColor();
      client.emit('list', this.user);
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`, error.stack);
    }
  }
  async afterInit() {
    const ENV = this.config.get('NODE_ENV');
    if (ENV === 'production') await this.socketService.deleteAllRoom();
    this.user = {};
    this.game = {};
    this.lastService.server = this.server;
    this.kungService.server = this.server;
    this.bellService.server = this.server;
    console.log('socket is open!');
  }
  async handleDisconnect(client) {
    try {
      this.currentConnections--;
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
      if (this.user[client.id].provider === 'guest') {
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
        this.currentConnections--;
        delete this.user[client.id];
        this.server.emit('list', this.user);
      } catch (cleanupError) {
        this.logger.error(
          `Additional cleanup error: ${cleanupError.message}`,
          cleanupError.stack,
        );
      }
=======
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const socket_service_1 = require("./socket.service");
let SocketGateway = class SocketGateway {
    constructor(socketService) {
        this.socketService = socketService;
        this.clients = {};
        this.rooms = { ['xxx1']: [] };
        this.turn = {};
    }
    handleConnection(client) {
        this.clients[client.id] = client.id;
        console.log('connect:', client.id);
>>>>>>> 4b3bc0d (feat: turn 개발)
    }
  }
  handlePing(roomId) {
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
  handlePong(roomId) {
    clearInterval(this.ping[roomId]);
    delete this.ping[roomId];
  }
  handleUserList(client) {
    client.emit('list', this.user);
  }
  handleAlarm(message) {
    this.server.emit('alarm', { message });
  }
  async handleRoomList(client) {
    const roomList = await this.socketService.getRoomList();
    client.emit('roomList', roomList);
  }
  async handleLobbyChat(chat, client) {
    this.server.emit('lobby.chat', {
      user: this.user[client.id],
      chat: chat,
    });
  }
  async handleMessage({ roomId, chat, roundTime, score, success }, client) {
    const isGameTurn =
      this.roomInfo[roomId].start &&
      (this.game[roomId].turn === -1 ||
        this.game[roomId].users[this.game[roomId].turn].id === client.id);
    if (!isGameTurn || roundTime === null) {
      return this.server
        .to(roomId)
        .emit('chat', { user: this.user[client.id], chat });
    }
<<<<<<< HEAD
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
  async handleGameMessage(roomId, messageData, client) {
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
    } finally {
      this.game[roomId].loading = false;
    }
  }
  async handleCreate(data, client) {
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
  async handleUpdate({ roomId, data }, client) {
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
=======
    handleDisconnect(client) {
        const roomId = this.clients[client.id];
        delete this.clients[client.id];
        if (roomId)
            this.rooms[roomId] = this.rooms[roomId].filter((id) => id !== client.id);
        console.log('disconnect:', client.id);
    }
    async handleMessage({ roomId, message }, client) {
        console.log(roomId, message);
        if (this.turn[roomId] == client.id) {
            const response = await this.socketService.findWord(message);
            this.server.to(roomId).emit('game', JSON.stringify(response));
        }
        this.server.to(roomId).emit('chat', message);
    }
    handleEnter(roomId, client) {
        client.join(roomId);
        this.clients[client.id] = roomId;
        this.server.to(roomId).emit('enter', `${client.id}이 입장`);
        this.rooms[roomId].push(client.id);
        console.log(this.clients, this.rooms);
    }
    handleExit(roomId, client) {
        console.log('exit');
        client.leave(roomId);
        this.rooms[roomId] = this.rooms[roomId].filter((id) => id !== client.id);
        this.server.to(roomId).emit('exit', `${client.id}이 퇴장`);
        console.log(this.rooms);
>>>>>>> 4b3bc0d (feat: turn 개발)
    }
  }
  async handleEnter({ roomId, password }, client) {
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
<<<<<<< HEAD
  }
  async handleExit(roomId, client) {
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
  handleKick({ roomId, userId }, client) {
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
  async hanldeKickHelper(roomId, client) {
    await this.handleExit(roomId, client);
    client.emit('alarm', { message: '퇴장 당하셨습니다.' });
  }
  handleChangeHost({ roomId, userId }, client) {
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
  handleTeam({ roomId, team }, client) {
    const teams = ['woo', 'gomem', 'academy', 'isedol'];
    const userId = this.user[client.id].id;
    teams.forEach((teamName) => {
      const index = this.game[roomId].team[teamName].indexOf(userId);
      if (index !== -1) {
        this.game[roomId].team[teamName].splice(index, 1);
      }
    });
    this.game[roomId].team[team].push(userId);
    this.user[client.id].team = team;
    this.server.to(roomId).emit('team', this.game[roomId]);
  }
  handleExitTeam(roomId, client) {
    const teams = ['woo', 'gomem', 'academy', 'isedol'];
    teams.forEach((team) => {
      const userIndex = this.game[roomId].team[team].findIndex(
        (userId) => userId === this.user[client.id].id,
      );
      if (userIndex !== -1) {
        this.game[roomId].team[team].splice(userIndex, 1);
      }
    });
  }
  handleReady(roomId, client) {
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
  handleExitReady(roomId, client) {
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
  handleHostReady({ roomId, id }) {
    if (this.game[roomId] && this.game[roomId].users) {
      const index = this.game[roomId].users.findIndex((x) => x.userId === id);
      if (index === -1) return;
      this.game[roomId].users.splice(index, 1);
    }
  }
  async handleStart(roomId) {
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
  async handleInfo(client) {
    client.emit('info', {
      game: this.game,
      user: this.user,
      roomInfo: this.roomInfo,
    });
  }
  async handleLastStart(roomId, client) {
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
  async handleLastRound(roomId) {
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
  async handleTurnStart(roomId) {
    this.server.to(roomId).emit('last.turnStart');
  }
  async handleTurnEnd(roomId) {
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
  async handleLastAnswer({ roomId, chat, roundTime, score, success }) {
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
  async handleKungStart(roomId, client) {
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
  handleKungRound(roomId) {
    this.kungService.handleRound(
      roomId,
      this.roomInfo[roomId],
      this.game[roomId],
    );
  }
  async handleKungAnswer({ roomId, chat, roundTime, score, success }) {
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
  async handleKTurnStart(roomId) {
    this.server.to(roomId).emit('kung.turnStart');
  }
  handleKTurnEnd(roomId) {
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
  async handleBellStart(roomId, client) {
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
  async handleBellRound(roomId) {
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
  handleBellPing(roomId) {
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
  handleBellPong(roomId) {
    clearInterval(this.ping[roomId]);
    delete this.ping[roomId];
    this.server.to(roomId).emit('bell.pong');
  }
  handleBellRoundStart(roomId) {
    this.server.to(roomId).emit('bell.roundStart');
  }
  handleBellRoundEnd(roomId) {
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
  handleBellAnswer({ roomId, score }, client) {
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
});
=======
    handleTest(data, server) {
        console.log(data, server);
    }
    handleTurn(roomId, client) {
        this.turn[roomId] = client.id;
        this.server.to(roomId).emit('turn', `Turn : ${client.id}`);
    }
};
>>>>>>> 4b3bc0d (feat: turn 개발)
exports.SocketGateway = SocketGateway;
__decorate(
  [
    (0, websockets_1.WebSocketServer)(),
    __metadata('design:type', socket_io_1.Server),
  ],
  SocketGateway.prototype,
  'server',
  void 0,
);
__decorate(
  [
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object]),
    __metadata('design:returntype', Promise),
  ],
  SocketGateway.prototype,
  'handleConnection',
  null,
);
__decorate(
  [
    (0, websockets_1.SubscribeMessage)('ping'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', void 0),
  ],
  SocketGateway.prototype,
  'handlePing',
  null,
);
__decorate(
  [
    (0, websockets_1.SubscribeMessage)('pong'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object]),
    __metadata('design:returntype', void 0),
  ],
  SocketGateway.prototype,
  'handlePong',
  null,
);
__decorate(
  [
    (0, websockets_1.SubscribeMessage)('list'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [socket_io_1.Socket]),
    __metadata('design:returntype', void 0),
  ],
  SocketGateway.prototype,
  'handleUserList',
  null,
);
__decorate(
  [
    (0, websockets_1.SubscribeMessage)('alarm'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', void 0),
  ],
  SocketGateway.prototype,
  'handleAlarm',
  null,
);
__decorate(
  [
    (0, websockets_1.SubscribeMessage)('roomList'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [socket_io_1.Socket]),
    __metadata('design:returntype', Promise),
  ],
  SocketGateway.prototype,
  'handleRoomList',
  null,
);
__decorate(
  [
    (0, websockets_1.SubscribeMessage)('lobby.chat'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, socket_io_1.Socket]),
    __metadata('design:returntype', Promise),
  ],
  SocketGateway.prototype,
  'handleLobbyChat',
  null,
);
__decorate(
  [
    (0, websockets_1.SubscribeMessage)('chat'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
<<<<<<< HEAD
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object, socket_io_1.Socket]),
    __metadata('design:returntype', Promise),
  ],
  SocketGateway.prototype,
  'handleMessage',
  null,
);
__decorate(
  [
    (0, websockets_1.SubscribeMessage)('createRoom'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [create_room_dto_1.CreateRoomDto, Object]),
    __metadata('design:returntype', Promise),
  ],
  SocketGateway.prototype,
  'handleCreate',
  null,
);
__decorate(
  [
    (0, websockets_1.SubscribeMessage)('updateRoom'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object, Object]),
    __metadata('design:returntype', Promise),
  ],
  SocketGateway.prototype,
  'handleUpdate',
  null,
);
__decorate(
  [
=======
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleMessage", null);
__decorate([
>>>>>>> 4b3bc0d (feat: turn 개발)
    (0, websockets_1.SubscribeMessage)('enter'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object, Object]),
    __metadata('design:returntype', Promise),
  ],
  SocketGateway.prototype,
  'handleEnter',
  null,
);
__decorate(
  [
    (0, websockets_1.SubscribeMessage)('exit'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, socket_io_1.Socket]),
    __metadata('design:returntype', Promise),
  ],
  SocketGateway.prototype,
  'handleExit',
  null,
);
__decorate(
  [
    (0, websockets_1.SubscribeMessage)('kick'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object, socket_io_1.Socket]),
    __metadata('design:returntype', void 0),
  ],
  SocketGateway.prototype,
  'handleKick',
  null,
);
__decorate(
  [
    (0, websockets_1.SubscribeMessage)('kick helper'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, socket_io_1.Socket]),
    __metadata('design:returntype', Promise),
  ],
  SocketGateway.prototype,
  'hanldeKickHelper',
  null,
);
__decorate(
  [
    (0, websockets_1.SubscribeMessage)('host'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object, socket_io_1.Socket]),
    __metadata('design:returntype', void 0),
  ],
  SocketGateway.prototype,
  'handleChangeHost',
  null,
);
__decorate(
  [
    (0, websockets_1.SubscribeMessage)('team'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object, socket_io_1.Socket]),
    __metadata('design:returntype', void 0),
  ],
  SocketGateway.prototype,
  'handleTeam',
  null,
);
__decorate(
  [
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, socket_io_1.Socket]),
    __metadata('design:returntype', void 0),
  ],
  SocketGateway.prototype,
  'handleExitTeam',
  null,
);
__decorate(
  [
    (0, websockets_1.SubscribeMessage)('ready'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, socket_io_1.Socket]),
    __metadata('design:returntype', void 0),
  ],
  SocketGateway.prototype,
  'handleReady',
  null,
);
__decorate(
  [
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, socket_io_1.Socket]),
    __metadata('design:returntype', void 0),
  ],
  SocketGateway.prototype,
  'handleExitReady',
  null,
);
__decorate(
  [
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object]),
    __metadata('design:returntype', void 0),
  ],
  SocketGateway.prototype,
  'handleHostReady',
  null,
);
__decorate(
  [
    (0, websockets_1.SubscribeMessage)('start'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', Promise),
  ],
  SocketGateway.prototype,
  'handleStart',
  null,
);
__decorate(
  [
    (0, websockets_1.SubscribeMessage)('info'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
<<<<<<< HEAD
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [socket_io_1.Socket]),
    __metadata('design:returntype', Promise),
  ],
  SocketGateway.prototype,
  'handleInfo',
  null,
);
__decorate(
  [
    (0, websockets_1.SubscribeMessage)('last.start'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, socket_io_1.Socket]),
    __metadata('design:returntype', Promise),
  ],
  SocketGateway.prototype,
  'handleLastStart',
  null,
);
__decorate(
  [
    (0, websockets_1.SubscribeMessage)('last.round'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', Promise),
  ],
  SocketGateway.prototype,
  'handleLastRound',
  null,
);
__decorate(
  [
    (0, websockets_1.SubscribeMessage)('last.turnStart'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', Promise),
  ],
  SocketGateway.prototype,
  'handleTurnStart',
  null,
);
__decorate(
  [
    (0, websockets_1.SubscribeMessage)('last.turnEnd'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', Promise),
  ],
  SocketGateway.prototype,
  'handleTurnEnd',
  null,
);
__decorate(
  [
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object]),
    __metadata('design:returntype', Promise),
  ],
  SocketGateway.prototype,
  'handleLastAnswer',
  null,
);
__decorate(
  [
    (0, websockets_1.SubscribeMessage)('kung.start'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, socket_io_1.Socket]),
    __metadata('design:returntype', Promise),
  ],
  SocketGateway.prototype,
  'handleKungStart',
  null,
);
__decorate(
  [
    (0, websockets_1.SubscribeMessage)('kung.round'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', void 0),
  ],
  SocketGateway.prototype,
  'handleKungRound',
  null,
);
__decorate(
  [
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object]),
    __metadata('design:returntype', Promise),
  ],
  SocketGateway.prototype,
  'handleKungAnswer',
  null,
);
__decorate(
  [
    (0, websockets_1.SubscribeMessage)('kung.turnStart'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', Promise),
  ],
  SocketGateway.prototype,
  'handleKTurnStart',
  null,
);
__decorate(
  [
    (0, websockets_1.SubscribeMessage)('kung.turnEnd'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', void 0),
  ],
  SocketGateway.prototype,
  'handleKTurnEnd',
  null,
);
__decorate(
  [
    (0, websockets_1.SubscribeMessage)('bell.start'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, socket_io_1.Socket]),
    __metadata('design:returntype', Promise),
  ],
  SocketGateway.prototype,
  'handleBellStart',
  null,
);
__decorate(
  [
    (0, websockets_1.SubscribeMessage)('bell.round'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', Promise),
  ],
  SocketGateway.prototype,
  'handleBellRound',
  null,
);
__decorate(
  [
    (0, websockets_1.SubscribeMessage)('bell.ping'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', void 0),
  ],
  SocketGateway.prototype,
  'handleBellPing',
  null,
);
__decorate(
  [
    (0, websockets_1.SubscribeMessage)('bell.pong'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object]),
    __metadata('design:returntype', void 0),
  ],
  SocketGateway.prototype,
  'handleBellPong',
  null,
);
__decorate(
  [
    (0, websockets_1.SubscribeMessage)('bell.roundStart'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', void 0),
  ],
  SocketGateway.prototype,
  'handleBellRoundStart',
  null,
);
__decorate(
  [
    (0, websockets_1.SubscribeMessage)('bell.roundEnd'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', void 0),
  ],
  SocketGateway.prototype,
  'handleBellRoundEnd',
  null,
);
__decorate(
  [
    (0, websockets_1.SubscribeMessage)('bell.answer'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object, socket_io_1.Socket]),
    __metadata('design:returntype', void 0),
  ],
  SocketGateway.prototype,
  'handleBellAnswer',
  null,
);
exports.SocketGateway =
  SocketGateway =
  SocketGateway_1 =
    __decorate(
      [
        (0, websockets_1.WebSocketGateway)({
          namespace: 'wakttu',
          cors: { origin: true, credentials: true },
          transports: ['websocket'],
          pingInterval: 10000,
          pingTimeout: 5000,
          upgradeTimeout: 10000,
          maxHttpBufferSize: 1e6,
        }),
        __param(
          0,
          (0, common_1.Inject)(
            (0, common_1.forwardRef)(() => last_service_1.LastService),
          ),
        ),
        __param(
          1,
          (0, common_1.Inject)(
            (0, common_1.forwardRef)(() => kung_service_1.KungService),
          ),
        ),
        __param(
          2,
          (0, common_1.Inject)(
            (0, common_1.forwardRef)(() => bell_service_1.BellService),
          ),
        ),
        __metadata('design:paramtypes', [
          last_service_1.LastService,
          kung_service_1.KungService,
          bell_service_1.BellService,
          socket_service_1.SocketService,
          socket_auth_guard_1.SocketAuthenticatedGuard,
          config_1.ConfigService,
        ]),
      ],
      SocketGateway,
    );
//# sourceMappingURL=socket.gateway.js.map
=======
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], SocketGateway.prototype, "handleStatus", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('turn'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], SocketGateway.prototype, "handleTurn", null);
exports.SocketGateway = SocketGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ namespace: 'wakttu' }),
    __metadata("design:paramtypes", [socket_service_1.SocketService])
], SocketGateway);
//# sourceMappingURL=socket.gateway.js.map
>>>>>>> 4b3bc0d (feat: turn 개발)
