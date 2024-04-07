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
let SocketGateway = class SocketGateway {
    constructor(socketService) {
        this.socketService = socketService;
        this.clients = {};
        this.rooms = {};
        this.turn = {};
    }
    handleConnection(client) {
        console.log('connect:', client.id);
    }
    afterInit() {
        console.log('socket is open!');
    }
    handleDisconnect(client) {
        const roomId = this.clients[client.id];
        delete this.clients[client.id];
        if (roomId)
            this.rooms[roomId] = this.rooms[roomId].filter((id) => id !== client.id);
        this.server.to(roomId).emit('list', JSON.stringify(this.rooms[roomId]));
        console.log('disconnect:', client.id);
    }
    async handleMessage({ roomId, chat }, client) {
        this.server.to(roomId).emit('chat', `${client.id}:${chat}`);
    }
    handleEnter(roomId, client) {
        if (client.rooms.has(roomId)) {
            return;
        }
        client.join(roomId);
        this.clients[client.id] = roomId;
        if (!this.rooms[roomId]) {
            this.rooms[roomId] = [];
        }
        this.rooms[roomId] = [client.id];
        this.server.to(roomId).emit('list', JSON.stringify(this.rooms[roomId]));
        this.server.to(roomId).emit('enter', `${client.id}이 입장`);
    }
    handleExit(roomId, client) {
        console.log('exit');
        if (!client.rooms.has(roomId)) {
            return;
        }
        client.leave(roomId);
        this.rooms[roomId] = this.rooms[roomId].filter((id) => id !== client.id);
        this.server.to(roomId).emit('list', JSON.stringify(this.rooms[roomId]));
        this.server.to(roomId).emit('exit', `${client.id}이 퇴장`);
    }
    handleTurnStart(roomId, client) {
        this.turn[roomId] = client.id;
        this.server.to(roomId).emit('turn_start', `${client.id}님 턴!`);
    }
    handleTurnEnd(roomId, client) {
        this.turn[roomId] = null;
        this.server.to(roomId).emit('turn_end', `${client.id}님 턴 종료!`);
    }
    async handleAnswer({ roomId, chat }, client) {
        if (this.turn[roomId] !== client.id) {
            return;
        }
        const check = await this.socketService.findWord(chat);
        this.server.to(roomId).emit('answer', JSON.stringify(check));
    }
};
exports.SocketGateway = SocketGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], SocketGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('chat'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('enter'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], SocketGateway.prototype, "handleEnter", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('exit'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], SocketGateway.prototype, "handleExit", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('turn_start'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], SocketGateway.prototype, "handleTurnStart", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('turn_end'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], SocketGateway.prototype, "handleTurnEnd", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('answer'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleAnswer", null);
exports.SocketGateway = SocketGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ namespace: 'wakttu' }),
    __metadata("design:paramtypes", [socket_service_1.SocketService])
], SocketGateway);
//# sourceMappingURL=socket.gateway.js.map