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
const wakgames_service_1 = require("../wakgames/wakgames.service");
const crypto_1 = require("crypto");
let AuthService = class AuthService {
    constructor(userService, wakgamesService) {
        this.userService = userService;
        this.wakgamesService = wakgamesService;
    }
    async OAuthLogin(user) {
        try {
            const response = await this.userService.findById(user.id);
            if (!response)
                return await this.userService.create(user);
            return response;
        }
        catch (error) {
            throw new common_1.BadRequestException('OAuth 로그인 처리 중 오류가 발생했습니다.');
        }
    }
    async LocalLogin(user) {
        try {
            const response = await this.userService.findById(user.email || user.id);
            if (!response)
                throw new common_1.UnauthorizedException('해당하는 유저가 없습니다.');
            const passwordMatch = await this.passworMatch(user.password, response.password);
            if (!passwordMatch)
                throw new common_1.UnauthorizedException('password is not equal');
            return response;
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException)
                throw error;
            throw new common_1.BadRequestException('로그인 처리 중 오류가 발생했습니다.');
        }
    }
    async passworMatch(password, hash) {
        return await bcrypt.compare(password, hash);
    }
    async logout(request) {
        const { id, provider } = request.session.user;
        if (provider === 'guest')
            this.userService.deleteGuest(id);
        request.session.destroy(() => { });
        return { success: true, message: 'Logout Success' };
    }
    async signup({ id, name, password }) {
        try {
            const checkId = await this.userService.findById(id);
            if (checkId)
                return { status: 403, message: '이미 존재하는 아이디' };
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
        catch (error) {
            throw new common_1.BadRequestException('회원가입 처리 중 오류가 발생했습니다.');
        }
    }
    async checkId(id) {
        const checkId = await this.userService.findById(id);
        if (checkId)
            return { status: 403, success: false, message: '이미 존재하는 아이디' };
        return { status: 201, success: true, message: '사용가능한 아이디' };
    }
    async checkName(name) {
        const checkName = await this.userService.findByName(name);
        if (checkName)
            return { status: 403, success: false, message: '이미 존재하는 닉네임' };
        return { status: 201, success: true, message: '사용가능한 닉네임' };
    }
    async waktaOauth() {
        return this.wakgamesService.getAuth();
    }
    async waktaLogin(auth) {
        try {
            let { data, response } = await this.wakgamesService.getToken(auth);
            if (response.status !== 201)
                throw new common_1.UnauthorizedException();
            const { accessToken, refreshToken, idToken } = data;
            ({ data, response } = await this.wakgamesService.getProfile(accessToken));
            if (response.status === 400)
                throw new common_1.BadRequestException();
            const user = await this.userService.findById(String(idToken));
            if (!user) {
                const newUser = await this.userService.create({
                    id: String(idToken),
                    name: data.name,
                    provider: 'waktaverse.games',
                    password: undefined,
                });
                return {
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                    user: newUser,
                };
            }
            else {
                if (user.name !== data.name) {
                    await this.userService.update(user.id, { name: data.name });
                    user.name = data.name;
                }
            }
            return {
                accessToken: accessToken,
                refreshToken: refreshToken,
                user: user,
            };
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException ||
                error instanceof common_1.BadRequestException)
                throw error;
            throw new common_1.BadRequestException('왁타버스 로그인 처리 중 오류가 발생했습니다.');
        }
    }
    async waktaUpdateToken(token) {
        try {
            const data = await this.wakgamesService.updateToken(token);
            const { accessToken, refreshToken } = data;
            if (!accessToken || !refreshToken)
                throw new common_1.UnauthorizedException();
            return {
                accessToken: accessToken,
                refreshToken: refreshToken,
            };
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException)
                throw error;
            throw new common_1.BadRequestException('토큰 업데이트 중 오류가 발생했습니다.');
        }
    }
    async discordUser(custom) {
        try {
            const _user = await this.userService.findById(custom.id);
            if (_user) {
                return _user;
            }
            const user = {
                id: custom.id,
                name: custom.username,
                provider: 'discord',
                password: null,
            };
            const newUser = await this.userService.create(user);
            return newUser;
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException)
                throw error;
            console.log(error);
            throw new common_1.BadRequestException('디코 로그인 중 오류가 발생했습니다.');
        }
    }
    async guestUser() {
        try {
            const user = {
                id: (0, crypto_1.randomUUID)(),
                name: '게스트' + Math.floor(Math.random() * 1000),
                provider: 'guest',
                password: null,
            };
            const newUser = await this.userService.create(user);
            return newUser;
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException)
                throw error;
            console.log(error);
            throw new common_1.BadRequestException('게스트 생성 중 오류가 발생했습니다.');
        }
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
    __metadata("design:paramtypes", [user_service_1.UserService,
        wakgames_service_1.WakgamesService])
], AuthService);
//# sourceMappingURL=auth.service.js.map