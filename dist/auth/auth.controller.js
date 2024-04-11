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
const naver_auth_guard_1 = require("./naver-auth.guard");
const swagger_1 = require("@nestjs/swagger");
const local_auth_guard_1 = require("./local-auth.guard");
const create_user_dto_1 = require("../user/dto/create-user.dto");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async naverLogin() { }
    async naverLoginCallback(req, res) {
        const user = req.user;
        await this.authService.OAuthLogin(user);
        return res.redirect('/list.html');
    }
    logout(request) {
        return this.authService.logout(request);
    }
    async login() {
        return await this.authService.login();
    }
    async signup(user) {
        return await this.authService.signup(user);
    }
    async user(req) {
        if (req.user) {
            console.log(req.user, 'Authenticated User');
            return {
                msg: 'Authenticated',
            };
        }
        else {
            console.log(req.user, 'User cannot found');
            return {
                msg: 'Not Authenticated',
            };
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Oauth Naver Login' }),
    (0, common_1.Get)('naver'),
    (0, common_1.UseGuards)(naver_auth_guard_1.NaverAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "naverLogin", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Oauth Naver login Callback' }),
    (0, common_1.Get)('naver/callback'),
    (0, common_1.UseGuards)(naver_auth_guard_1.NaverAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "naverLoginCallback", null);
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
                email: { type: 'string' },
                password: { type: 'string' },
            },
        },
    }),
    (0, common_1.Post)('local'),
    (0, common_1.UseGuards)(local_auth_guard_1.LocalGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
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
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signup", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'check to login User' }),
    (0, common_1.Get)('status'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "user", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map