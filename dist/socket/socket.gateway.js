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
        this.rooms = { ['xxx1']: [] };
        this.turn = {};
    }
    handleConnection(client) {
        this.clients[client.id] = client.id;
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
    }
    handleStatus(client) {
        console.log(client.rooms);
    }
    handleTest(data, server) {
        console.log(data, server);
    }
    handleTurn(roomId, client) {
        this.turn[roomId] = client.id;
        this.server.to(roomId).emit('turn', `Turn : ${client.id}`);
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
    (0, websockets_1.SubscribeMessage)('status'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
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