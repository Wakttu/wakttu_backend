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
exports.WakgamesController = void 0;
const common_1 = require("@nestjs/common");
const wakgames_service_1 = require("./wakgames.service");
const wakgames_guard_1 = require("./wakgames.guard");
let WakgamesController = class WakgamesController {
    constructor(wakgamesService) {
        this.wakgamesService = wakgamesService;
    }
    async getProfile(session) {
        const { data, response } = await this.wakgamesService.getProfile(session.accessToken);
        if (response.status === 401) {
            const { data, response } = await this.wakgamesService.updateToken(session.refreshToken);
            if (response.status !== 200)
                throw new common_1.UnauthorizedException();
            session.accessToken = data.accessToken;
            session.refreshToken = data.refreshToken;
            return await this.getProfile(session);
        }
        return data;
    }
    async getAchieve(session) {
        const { data, response } = await this.wakgamesService.getAchieve(session.accessToken);
        if (response.status === 401) {
            const { data, response } = await this.wakgamesService.updateToken(session.refreshToken);
            if (response.status !== 200)
                throw new common_1.UnauthorizedException();
            session.accessToken = data.accessToken;
            session.refreshToken = data.refreshToken;
            return await this.getAchieve(session);
        }
        return data;
    }
    async postAchieve(query, session) {
        const { data, response } = await this.wakgamesService.postAchieve(query, session.accessToken);
        if (response.status === 401) {
            const { data, response } = await this.wakgamesService.updateToken(session.refreshToken);
            if (response.status !== 200)
                throw new common_1.UnauthorizedException();
            session.accessToken = data.accessToken;
            session.refreshToken = data.refreshToken;
            return await this.postAchieve(query, session);
        }
        else if (response.status === 409) {
            return {
                status: response.status,
                message: '이미 달성된 도전과제입니다!',
            };
        }
        else if (response.status === 404) {
            return {
                status: response.status,
                message: '해당 도전 과제를 찾을 수 없습니다.',
            };
        }
        return data;
    }
    async getStat(query, session) {
        const { data, response } = await this.wakgamesService.getStat(query, session.accessToken);
        if (response.status === 401) {
            const { data, response } = await this.wakgamesService.updateToken(session.refreshToken);
            if (response.status !== 200)
                throw new common_1.UnauthorizedException();
            session.accessToken = data.accessToken;
            session.refreshToken = data.refreshToken;
            return await this.getStat(query, session);
        }
        return data;
    }
    async putStat(body, session) {
        const { data, response } = await this.wakgamesService.putStat(body, session.accessToken);
        if (response.status === 401) {
            const { data, response } = await this.wakgamesService.updateToken(session.refreshToken);
            if (response.status !== 200)
                throw new common_1.UnauthorizedException();
            session.accessToken = data.accessToken;
            session.refreshToken = data.refreshToken;
            return await this.putStat(body, session);
        }
        return data;
    }
    async putResult(body, session) {
        return await this.wakgamesService.putResult(body, session);
    }
};
exports.WakgamesController = WakgamesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WakgamesController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Get)('achieve'),
    __param(0, (0, common_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WakgamesController.prototype, "getAchieve", null);
__decorate([
    (0, common_1.Post)('achieve'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WakgamesController.prototype, "postAchieve", null);
__decorate([
    (0, common_1.Get)('stat'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WakgamesController.prototype, "getStat", null);
__decorate([
    (0, common_1.Put)('stat'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WakgamesController.prototype, "putStat", null);
__decorate([
    (0, common_1.Put)('result'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WakgamesController.prototype, "putResult", null);
exports.WakgamesController = WakgamesController = __decorate([
    (0, common_1.UseGuards)(wakgames_guard_1.WakgamesGuard),
    (0, common_1.Controller)('wakta'),
    __metadata("design:paramtypes", [wakgames_service_1.WakgamesService])
], WakgamesController);
//# sourceMappingURL=wakgames.controller.js.map