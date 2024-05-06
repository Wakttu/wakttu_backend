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
exports.KungService = void 0;
const common_1 = require("@nestjs/common");
const socket_gateway_1 = require("../socket/socket.gateway");
const socket_service_1 = require("../socket/socket.service");
class Rule {
    constructor(count = 8) {
        this.ban = new Array(count).fill('');
    }
}
let KungService = class KungService {
    constructor(socketGateway, socketService) {
        this.socketGateway = socketGateway;
        this.socketService = socketService;
        this.rules = {};
    }
    async handleStart(roomId, roomInfo, game) {
        game.total = game.users.length;
        game.keyword = await this.socketService.setWord(roomInfo.round);
        roomInfo.start = (await this.socketService.setStart(roomId, roomInfo.start)).start;
        this.rules[roomId] = new Rule(roomInfo.users.length);
        this.server.to(roomId).emit('start', game);
    }
    handleBan(roomId, index, keyword) {
        this.rules[roomId].ban[index] = keyword;
    }
};
exports.KungService = KungService;
exports.KungService = KungService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)((0, common_1.forwardRef)(() => socket_gateway_1.SocketGateway))),
    __metadata("design:paramtypes", [socket_gateway_1.SocketGateway,
        socket_service_1.SocketService])
], KungService);
//# sourceMappingURL=kung.service.js.map