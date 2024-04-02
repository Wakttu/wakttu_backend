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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const swagger_1 = require("@nestjs/swagger");
const create_user_dto_1 = require("../user/dto/create-user.dto");
const isNotLogined_auth_guard_1 = require("./isNotLogined-auth.guard");
const local_auth_guard_1 = require("./local-auth.guard");
const login_user_dto_1 = require("../user/dto/login-user.dto");
const config_1 = require("@nestjs/config");
const cf_auth_guard_1 = require("./cf-auth.guard");
let AuthController = class AuthController {
    constructor(authService, configService) {
        this.authService = authService;
        this.configService = configService;
    }
    async logout(request) {
        return await this.authService.logout(request);
    }
    async localLogin(body, session) {
        const { password, ...user } = await this.authService.LocalLogin(body);
        session.user = user;
        return user;
    }
    async signup(user) {
        return await this.authService.signup(user);
    }
    async user(session) {
        return session;
    }
    async checkId(id) {
        return await this.authService.checkId(id);
    }
    async checkName(name) {
        return await this.authService.checkName(name);
    }
    async waktaOauth(session) {
        const data = await this.authService.waktaOauth();
        session.auth = data;
        return data;
    }
    async waktaCallback(query, req, res) {
        if (query.code) {
            req.session.auth.code = query.code;
            const data = await this.authService.waktaLogin(req.session.auth);
            const { accessToken, refreshToken, user } = data;
            req.session.accessToken = accessToken;
            req.session.refreshToken = refreshToken;
            req.session.user = user;
            return res.redirect(this.configService.get('REDIRECT_URL'));
        }
        else
            throw new common_1.BadRequestException();
    }
    async waktaRefresh(req) {
        const { accessToken, refreshToken } = await this.authService.waktaUpdateToken(req.session.refreshToken);
        req.session.accessToken = accessToken;
        req.session.refreshToken = refreshToken;
        return { status: 201, accessToken, refreshToken };
    }
    async discordAuh(req, session) {
        const { custom } = req.user;
        const user = await this.authService.discordUser(custom);
        session.user = user;
        return user;
    }
    async guest(session) {
        session.user = await this.authService.guestUser();
        return session.user ? { status: 200 } : { status: 400 };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'logout' }),
    (0, common_1.Get)('logout'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Local Login' }),
    (0, swagger_1.ApiBody)({
        schema: {
            properties: {
                id: { type: 'string' },
                password: { type: 'string' },
            },
        },
    }),
    (0, common_1.Post)('login'),
    (0, common_1.UseGuards)(local_auth_guard_1.LocalAuthenticatedGuard),
    (0, common_1.UseGuards)(isNotLogined_auth_guard_1.IsNotLoginedGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_user_dto_1.LoginUserDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "localLogin", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Local Signup' }),
    (0, swagger_1.ApiBody)({
        schema: {
            properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                password: { type: 'string' },
            },
        },
    }),
    (0, common_1.Post)('signup'),
    (0, common_1.UseGuards)(isNotLogined_auth_guard_1.IsNotLoginedGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signup", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'check to login User' }),
    (0, common_1.Get)('status'),
    __param(0, (0, common_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "user", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'check duplicate inspection of id' }),
    (0, swagger_1.ApiBody)({
        schema: {
            properties: {
                id: { type: 'string' },
            },
        },
    }),
    (0, common_1.Post)('check/id'),
    __param(0, (0, common_1.Body)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "checkId", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'check duplicate inspection of name' }),
    (0, swagger_1.ApiBody)({
        schema: {
            properties: {
                name: { type: 'string' },
            },
        },
    }),
    (0, common_1.Post)('check/name'),
    __param(0, (0, common_1.Body)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "checkName", null);
__decorate([
    (0, common_1.Get)('wakta'),
    __param(0, (0, common_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "waktaOauth", null);
__decorate([
    (0, common_1.Get)('wakta/callback'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "waktaCallback", null);
__decorate([
    (0, common_1.Get)('wakta/refresh'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "waktaRefresh", null);
__decorate([
    (0, common_1.UseGuards)(cf_auth_guard_1.CloudflareGuard),
    (0, common_1.Get)('discord'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "discordAuh", null);
__decorate([
    (0, common_1.Get)('guest'),
    __param(0, (0, common_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "guest", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        config_1.ConfigService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map