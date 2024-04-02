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
        game.turn = 0;
        game.round = 0;
        game.target = '';
        game.total = game.users.length;
        game.roundTime = roomInfo.time;
        roomInfo.start = true;
        await this.socketService.setStart(roomId, false);
        game.keyword = await this.socketService.setWord(roomInfo.round);
        if (roomInfo.option.includes('팀전'))
            this.socketService.teamShuffle(game, game.team);
        else
            this.socketService.shuffle(game);
        this.rules[roomId] = new Rule(roomInfo.users.length);
        this.server.to(roomId).emit('kung.start', game);
    }
    async handleRound(roomId, roomInfo, game) {
        if (!game)
            return;
        const curRound = game.round++;
        const lastRound = roomInfo.round;
        if (curRound === lastRound) {
            game.users.sort((a, b) => b.score - a.score);
            this.server
                .to(roomId)
                .emit('kung.result', { game: game, roomInfo: roomInfo });
            const scores = await this.socketService.setResult(game.users);
            roomInfo = await this.socketService.setStart(roomId, roomInfo.start);
            game.users.forEach((user) => {
                this.socketGateway.user[user.id].score = scores[user.id];
            });
            game.users.splice(0, game.total);
            this.server
                .to(roomId)
                .emit('kung.end', { game: game, roomInfo: roomInfo });
            return;
        }
        const target = game.keyword['_id'];
        game.target = target[curRound];
        game.chain = 1;
        game.roundTime = roomInfo.time;
        game.turnTime = this.socketService.getTurnTime(roomInfo.time);
        this.server.to(roomId).emit('kung.round', game);
    }
    handleNextTurn(game, keyword, score) {
        const team = game.users[game.turn].team;
        if (team) {
            game.users.forEach((user) => {
                if (user.team === team)
                    user.score += score;
            });
        }
        else
            game.users[game.turn].score += score;
        game.turn += 1;
        game.turn %= game.total;
        game.chain += 1;
        game.target = keyword[keyword.length - 1];
    }
    handleTurnEnd(game) {
        const chain = game.chain;
        const score = game.users[game.turn].score;
        const after = -1 * Math.round(Math.min(10 + chain * 1.5 + score * 0.15, score));
        const team = game.users[game.turn].team;
        if (team) {
            game.users.forEach((user) => {
                if (user.team === team)
                    user.score = score + after;
            });
        }
        else
            game.users[game.turn].score = score + after;
    }
    handleCheck(word, target, length) {
        if (length !== 3)
            return { success: false, message: '길이가 3이 아님' };
        if (word !== target) {
            return { success: false, message: '시작단어가 일치하지 않음' };
        }
        return { success: true, message: '통과' };
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