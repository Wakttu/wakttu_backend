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
exports.StatsController = void 0;
const common_1 = require("@nestjs/common");
const stats_service_1 = require("./stats.service");
const stats_guard_1 = require("./stats.guard");
let StatsController = class StatsController {
    constructor(stats) {
        this.stats = stats;
    }
    async getAchieve(session) {
        return await this.stats.getAchieve(session.user.id);
    }
    async createAchieve(id, session) {
        if (!id)
            throw new common_1.BadRequestException();
        return await this.stats.createAchieve(id, session.user.id);
    }
    async putStat(body, session) {
        const { statId, val } = body;
        if (!statId || !val)
            throw new common_1.BadRequestException();
        return await this.stats.putStat(session.user.id, body.statId, body.val);
    }
    async putResult(body, session) {
        return await this.stats.putResult(body, session.user);
    }
    async getRanks() {
        return await this.stats.getRanks();
    }
};
exports.StatsController = StatsController;
__decorate([
    (0, common_1.Get)('achieve'),
    __param(0, (0, common_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StatsController.prototype, "getAchieve", null);
__decorate([
    (0, common_1.Post)('achieve'),
    __param(0, (0, common_1.Body)('id')),
    __param(1, (0, common_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StatsController.prototype, "createAchieve", null);
__decorate([
    (0, common_1.Put)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StatsController.prototype, "putStat", null);
__decorate([
    (0, common_1.Put)('result'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StatsController.prototype, "putResult", null);
__decorate([
    (0, common_1.Get)('rank'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StatsController.prototype, "getRanks", null);
exports.StatsController = StatsController = __decorate([
    (0, common_1.Controller)('stats'),
    (0, common_1.UseGuards)(stats_guard_1.StatsGuard),
    __metadata("design:paramtypes", [stats_service_1.StatsService])
], StatsController);
//# sourceMappingURL=stats.controller.js.map