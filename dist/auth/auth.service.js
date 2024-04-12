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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("../user/user.service");
const bcrypt = require("bcrypt");
let AuthService = class AuthService {
    constructor(userService) {
        this.userService = userService;
    }
    async OAuthLogin(user) {
        const response = await this.userService.findById(user.id);
        if (!response)
            return await this.userService.create(user);
        return response;
    }
    async LocalLogin(user) {
        const response = await this.userService.findById(user.id);
        if (!response)
            throw new common_1.UnauthorizedException('해당하는 유저가 없습니다.');
        const passwordMatch = await this.passworMatch(user.password, response.password);
        if (!passwordMatch)
            throw new common_1.UnauthorizedException('password is not equal');
        return response;
    }
    async passworMatch(password, hash) {
        return await bcrypt.compare(password, hash);
    }
    async login() {
        return {
            message: 'Login successful',
        };
    }
    async logout(request) {
        request.session.destroy(() => {
            return {
                message: 'Logout successful',
            };
        });
    }
    async signup({ id, name, password }) {
        const checkId = await this.userService.findById(id);
        if (checkId)
            return { status: 403, message: '이미 존재하는 이메일' };
        const hashPassword = await bcrypt.hash(password, 5);
        const user = {
            id: id,
            name: name,
            password: hashPassword,
            provider: 'local',
        };
        const response = await this.userService.create(user);
        if (!response)
            return { status: 403, message: '회원가입 실패' };
        else
            return { status: 201, message: '회원가입 성공' };
    }
};
exports.AuthService = AuthService;
__decorate([
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthService.prototype, "logout", null);
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService])
], AuthService);
//# sourceMappingURL=auth.service.js.map