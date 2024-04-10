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
let SocketGateway = class SocketGateway {
    constructor(socketService) {
        this.socketService = socketService;
        this.user = {};
        this.roomInfo = {};
        this.turn = {};
    }
    handleConnection(client) {
        if (!client.request.user)
            return;
        this.user[client.id] = client.request.user;
        console.log('connect:', this.user[client.id].name);
        this.server.emit('list', this.user);
    }
    async afterInit() {
        await this.socketService.deleteAllRoom();
        console.log('socket is open!');
    }
    async handleDisconnect(client) {
        if (!client.request.user)
            return;
        const roomId = this.user[client.id].roomId;
        if (roomId) {
            await this.socketService.exitRoom(this.user[client.id].id);
            this.roomInfo[roomId] = await this.socketService.getRoom(roomId);
            console.log('disconnect:', this.user[client.id].name);
            if (this.roomInfo[roomId].users.length > 0) {
                this.roomInfo[roomId].host = this.roomInfo[roomId].users[0].name;
                this.server.to(roomId).emit('exit', this.roomInfo[roomId]);
            }
            else {
                delete this.roomInfo[roomId];
                await this.socketService.deleteRoom(roomId);
            }
        }
        delete this.user[client.id];
        this.server.emit('list', this.user);
    }
    handleAlarm(message) {
        this.server.emit('alarm', message);
    }
    async handleRoomList(client) {
        const roomList = await this.socketService.getRoomList();
        client.emit('roomList', roomList);
    }
    async handleMessage({ roomId, chat }, client) {
        this.server.to(roomId).emit('chat', `${this.user[client.id].name}:${chat}`);
    }
    async handleCreate(data, client) {
        this.user[client.id] = client.request.user;
        const room = await this.socketService.createRoom(this.user[client.id].id, data);
        this.roomInfo[room.id] = room;
        this.roomInfo[room.id].host = this.user[client.id].name;
        client.emit('createRoom', this.roomInfo[room.id]);
    }
    async handleEnter(roomId, client) {
        if (client.rooms.has(roomId)) {
            return;
        }
        if (!this.roomInfo[roomId])
            return;
        this.user[client.id].roomId = roomId;
        this.roomInfo[roomId] = await this.socketService.enterRoom(this.user[client.id].id, roomId);
        client.join(roomId);
        this.server.to(roomId).emit('enter', this.roomInfo[roomId]);
    }
    async handleExit(roomId, client) {
        console.log('exit');
        if (!client.rooms.has(roomId)) {
            return;
        }
        await this.socketService.exitRoom(this.user[client.id].id);
        this.roomInfo[roomId] = await this.socketService.getRoom(roomId);
        client.leave(roomId);
        if (this.roomInfo[roomId].users.length > 0) {
            this.roomInfo[roomId].host = this.roomInfo[roomId].users[0].name;
            this.server.to(roomId).emit('exit', this.roomInfo[roomId]);
        }
        else {
            delete this.roomInfo[roomId];
            await this.socketService.deleteRoom(roomId);
        }
    }
    async handleReady(roomId) {
        if (this.roomInfo[roomId].round == 0) {
            this.roomInfo[roomId].word = await this.socketService.getWord(this.roomInfo[roomId].round);
            this.server.to(roomId).emit('ready', this.roomInfo[roomId].word);
        }
    }
    async handleAnswer({ roomId, chat }, client) {
        if (this.turn[roomId] !== client.id) {
            return;
        }
        const check = await this.socketService.findWord(chat);
        this.server.to(roomId).emit('answer', check);
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
    __metadata("design:paramtypes", [String, Object]),
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
    (0, websockets_1.SubscribeMessage)('ready'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleReady", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('answer'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleAnswer", null);
exports.SocketGateway = SocketGateway = __decorate([
    (0, common_1.UseGuards)(socket_auth_guard_1.SocketAuthenticatedGuard),
    (0, websockets_1.WebSocketGateway)({ namespace: 'wakttu' }),
    __metadata("design:paramtypes", [socket_service_1.SocketService])
], SocketGateway);
//# sourceMappingURL=socket.gateway.js.map