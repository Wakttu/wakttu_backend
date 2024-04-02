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
exports.BellService = void 0;
const common_1 = require("@nestjs/common");
const socket_gateway_1 = require("../socket/socket.gateway");
const socket_service_1 = require("../socket/socket.service");
const hangul_1 = require("./hangul");
let BellService = class BellService {
    constructor(socketGateway, socketService) {
        this.socketGateway = socketGateway;
        this.socketService = socketService;
        this.answer = {};
    }
    async handleStart(roomId, roomInfo, game) {
        game.turn = -1;
        game.round = 0;
        game.target = '';
        game.total = game.users.length;
        game.quiz = await this.socketService.getQuiz(roomInfo.round);
        roomInfo.start = true;
        await this.socketService.setStart(roomId, false);
        this.server.to(roomId).emit('bell.start', game);
    }
    async handleRound(roomId, roomInfo, game) {
        if (!game)
            return;
        if (game.round === roomInfo.round) {
            game.users.sort((a, b) => b.score - a.score);
            this.server
                .to(roomId)
                .emit('bell.result', { game: game, roomInfo: roomInfo });
            const scores = await this.socketService.setResult(game.users);
            roomInfo = await this.socketService.setStart(roomId, roomInfo.start);
            game.users.forEach((user) => {
                this.socketGateway.user[user.id].score = scores[user.id];
            });
            game.users.splice(0, game.total);
            game.turn = -1;
            this.server
                .to(roomId)
                .emit('bell.end', { game: game, roomInfo: roomInfo });
            return;
        }
        game.users.forEach((user) => (user.success = undefined));
        game.roundTime = 30000;
        game.target = game.quiz[game.round]._id;
        game.quiz[game.round].choseong = (0, hangul_1.hangulTools)().toChoseong(game.target);
        const choseong = game.quiz[game.round].choseong;
        const arr = this.getCombinations(game.target.length);
        game.quiz[game.round].hint = arr.map((item) => {
            const mul = choseong.split('');
            item.map((val) => {
                mul[val] = game.target[val];
            });
            return mul.join('');
        });
        game.round += 1;
        this.server.to(roomId).emit('bell.round', game);
    }
    getCombinations(len) {
        const requiredIndices = 2 * Math.floor(len / 3);
        if (len < requiredIndices) {
            return [];
        }
        const hint = [];
        const usedIndices = new Set();
        const hintSize = Math.floor(len / 3);
        while (hint.length < 2) {
            const results = [];
            for (let i = 0; i < hintSize; i++) {
                let idx;
                do {
                    idx = Math.floor(Math.random() * len);
                } while (usedIndices.has(idx));
                results.push(idx);
                usedIndices.add(idx);
            }
            hint.push(results);
        }
        return hint;
    }
    handleAnswer(idx, game, score) {
        const team = game.users[idx].team;
        if (team) {
            game.users.forEach((user) => {
                if (user.team === team) {
                    user.score += score;
                    user.success = true;
                }
            });
        }
        else {
            game.users[idx].score += score;
            game.users[idx].success = true;
        }
    }
};
exports.BellService = BellService;
exports.BellService = BellService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)((0, common_1.forwardRef)(() => socket_gateway_1.SocketGateway))),
    __metadata("design:paramtypes", [socket_gateway_1.SocketGateway,
        socket_service_1.SocketService])
], BellService);
//# sourceMappingURL=bell.service.js.map