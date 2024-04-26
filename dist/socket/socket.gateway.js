"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
const common_1 = require("@nestjs/common");
const socket_auth_guard_1 = require("../auth/socket-auth.guard");
const create_room_dto_1 = require("../room/dto/create-room.dto");
const kung_service_1 = require("../kung/kung.service");
class Game {
    constructor() {
        this.host = '';
        this.round = 0;
        this.turn = 0;
        this.users = [];
    }
}
let SocketGateway = class SocketGateway {
    constructor(kungService, socketService) {
        this.kungService = kungService;
        this.socketService = socketService;
        this.user = {};
        this.roomInfo = {};
        this.game = {};
    }
    handleConnection(client) {
        if (!client.request.user)
            return;
        this.user[client.id] = client.request.user;
        this.server.emit('list', this.user);
    }
    async afterInit() {
        await this.socketService.deleteAllRoom();
        this.kungService.server = this.server;
        console.log('socket is open!');
    }
    async handleDisconnect(client) {
        if (!client.request.user)
            return;
        const roomId = this.user[client.id].roomId;
        if (roomId) {
            await this.socketService.exitRoom(this.user[client.id].id);
            this.roomInfo[roomId] = await this.socketService.getRoom(roomId);
            if (this.roomInfo[roomId].users &&
                this.roomInfo[roomId].users.length > 0) {
                this.game[roomId].host = this.roomInfo[roomId].users[0].name;
                this.server.to(roomId).emit('exit', this.roomInfo[roomId]);
            }
            else {
                delete this.roomInfo[roomId];
                delete this.game[roomId];
                await this.socketService.deleteRoom(roomId);
            }
        }
        delete this.user[client.id];
        this.server.emit('list', this.user);
    }
    handleAlarm(message) {
        this.server.emit('alarm', { message });
    }
    async handleRoomList(client) {
        const roomList = await this.socketService.getRoomList();
        client.emit('roomList', roomList);
    }
    async handleMessage({ roomId, chat }, client) {
        if (this.game[roomId].users[this.game[roomId].turn] === client.id) {
            this.handleAnswer({ roomId, chat });
        }
        else
            this.server
                .to(roomId)
                .emit('chat', { name: this.user[client.id].name, chat: chat });
    }
    async handleCreate(data, client) {
        this.user[client.id] = client.request.user;
        const info = await this.socketService.createRoom(this.user[client.id].id, data);
        const { password, ...room } = info;
        this.roomInfo[room.id] = room;
        this.game[room.id] = new Game();
        this.game[room.id].host = this.user[client.id].name;
        client.emit('createRoom', { roomId: room.id, password });
    }
    async handleEnter({ roomId, password }, client) {
        if (client.rooms.has(roomId)) {
            return;
        }
        if (!this.roomInfo[roomId])
            return;
        const check = await this.socketService.checkPassword(roomId, password);
        if (!check) {
            client.emit('alarm', '유효하지 않은 패스워드 입니다.');
            return;
        }
        this.roomInfo[roomId] = await this.socketService.enterRoom(this.user[client.id].id, roomId);
        client.join(roomId);
        this.user[client.id].roomId = roomId;
        this.server.to(roomId).emit('enter', this.roomInfo[roomId]);
    }
    async handleExit(roomId, client) {
        if (!client.rooms.has(roomId)) {
            return;
        }
        await this.socketService.exitRoom(this.user[client.id].id);
        this.roomInfo[roomId] = await this.socketService.getRoom(roomId);
        client.leave(roomId);
        if (this.roomInfo[roomId].users.length > 0) {
            this.game[roomId].host = this.roomInfo[roomId].users[0].name;
            this.server.to(roomId).emit('exit', this.roomInfo[roomId]);
        }
        else {
            delete this.roomInfo[roomId];
            delete this.game[roomId];
            await this.socketService.deleteRoom(roomId);
        }
    }
    handleKick({ roomId, userId }, client) {
        if (this.user[client.id].name !== this.game[roomId].host) {
            return;
        }
        const key = Object.keys(this.user).find((key) => this.user[key].id === userId);
        client.to(key).emit('kick helper', { socketId: key });
    }
    async hanldeKickHelper(roomId, client) {
        await this.handleExit(roomId, client);
        client.emit('alarm', '퇴장 당하셨습니다.');
    }
    handleReady(roomId, client) {
        const index = this.game[roomId].users.indexOf(client.id);
        if (index === -1) {
            this.game[roomId].users.push(client.id);
        }
        else {
            this.game[roomId].users.splice(index, 1);
        }
        this.server.to(roomId).emit('ready', this.game[roomId].users);
    }
    async handleStart(roomId, client) {
        if (this.game[roomId].host !== this.user[client.id].name) {
            return;
        }
        if (this.game[roomId].users.length !== this.roomInfo[roomId].users.length)
            return;
        this.game[roomId].total = this.game[roomId].users.length;
        this.game[roomId].keyword = await this.socketService.setWord(this.roomInfo[roomId].round);
        await this.socketService.setStart(roomId, this.roomInfo[roomId].start);
        this.server.to(roomId).emit('start', this.game[roomId]);
    }
    async handleAnswer({ roomId, chat }) {
        const check = await this.socketService.findWord(chat);
        if (check) {
            this.game[roomId].turn++;
            this.game[roomId].turn %= this.game[roomId].total;
            const target = check['id'];
            this.game[roomId].target = target[target.length - 1];
        }
        this.server.to(roomId).emit('turn', this.game[roomId]);
    }
    handleInfo(client) {
        client.emit('info', {
            game: this.game,
            user: this.user,
            roomInfo: this.roomInfo,
        });
    }
};
exports.SocketGateway = SocketGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], SocketGateway.prototype, "server", void 0);
__decorate([
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SocketGateway.prototype, "handleConnection", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('alarm'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SocketGateway.prototype, "handleAlarm", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('roomList'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleRoomList", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('chat'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('createRoom'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_room_dto_1.CreateRoomDto, Object]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleCreate", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('enter'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleEnter", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('exit'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleExit", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('kick'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], SocketGateway.prototype, "handleKick", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('kick helper'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "hanldeKickHelper", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('ready'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], SocketGateway.prototype, "handleReady", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('start'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleStart", null);
__decorate([
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleAnswer", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('info'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], SocketGateway.prototype, "handleInfo", null);
exports.SocketGateway = SocketGateway = __decorate([
    (0, common_1.UseGuards)(socket_auth_guard_1.SocketAuthenticatedGuard),
    (0, websockets_1.WebSocketGateway)({ namespace: 'wakttu' }),
    __param(0, (0, common_1.Inject)((0, common_1.forwardRef)(() => kung_service_1.KungService))),
    __metadata("design:paramtypes", [kung_service_1.KungService,
        socket_service_1.SocketService])
], SocketGateway);
//# sourceMappingURL=socket.gateway.js.map