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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("./user.service");
const create_user_dto_1 = require("./dto/create-user.dto");
const swagger_1 = require("@nestjs/swagger");
const update_user_dto_1 = require("./dto/update-user.dto");
const user_guard_1 = require("./user.guard");
const isLogined_auth_guard_1 = require("../auth/isLogined-auth.guard");
const isNotLogined_auth_guard_1 = require("../auth/isNotLogined-auth.guard");
const score_user_dto_1 = require("./dto/score-user.dto");
const roles_guard_1 = require("../roles/roles.guard");
const roles_decorator_1 = require("../roles/roles.decorator");
let UserController = class UserController {
    constructor(userService) {
        this.userService = userService;
    }
    async getUser(id) {
        const response = await this.userService.findById(id);
        delete response.password;
        return response;
    }
    async signUp(createUserDto) {
        return await this.userService.create(createUserDto);
    }
    async updateUser(id, body, session) {
        const user = await this.userService.update(id, body);
        session.user = user;
        return user;
    }
    async updateScore(id, score) {
        return await this.userService.updateScore(id, score);
    }
    async getItems(id) {
        const response = await this.userService.getItems(id);
        return response;
    }
    async achieveItem(session, itemId) {
        const user = session.user;
        return await this.userService.achieveItem(user.id, itemId);
    }
    async achieveAllItems(id) {
        return await this.userService.achieveAllItems(id);
    }
};
exports.UserController = UserController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get User Info by id' }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        type: 'string',
    }),
    (0, common_1.UseGuards)(isLogined_auth_guard_1.IsLoginedGuard, user_guard_1.AuthGuard),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUser", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'SignUp User' }),
    (0, swagger_1.ApiBody)({
        description: 'signup User',
        type: create_user_dto_1.CreateUserDto,
    }),
    (0, common_1.UseGuards)(isNotLogined_auth_guard_1.IsNotLoginedGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "signUp", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Update User' }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        type: 'string',
    }),
    (0, swagger_1.ApiBody)({
        description: 'update User',
        type: update_user_dto_1.UpdateUserDto,
    }),
    (0, common_1.UseGuards)(isLogined_auth_guard_1.IsLoginedGuard, user_guard_1.AuthGuard),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateUserDto, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateUser", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Update Score' }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        type: 'string',
    }),
    (0, swagger_1.ApiBody)({
        description: 'update score',
        type: score_user_dto_1.ScoreUserDto,
    }),
    (0, common_1.UseGuards)(isLogined_auth_guard_1.IsLoginedGuard, user_guard_1.AuthGuard),
    (0, common_1.Patch)('score/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('score')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateScore", null);
__decorate([
    (0, common_1.UseGuards)(isLogined_auth_guard_1.IsLoginedGuard),
    (0, common_1.Get)('items/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getItems", null);
__decorate([
    (0, common_1.UseGuards)(isLogined_auth_guard_1.IsLoginedGuard),
    (0, common_1.Post)('achieve/item'),
    __param(0, (0, common_1.Session)()),
    __param(1, (0, common_1.Body)('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "achieveItem", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(['manager', 'staff']),
    (0, common_1.Post)('achieve/item/all'),
    __param(0, (0, common_1.Body)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "achieveAllItems", null);
exports.UserController = UserController = __decorate([
    (0, swagger_1.ApiTags)('User'),
    (0, common_1.Controller)('user'),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
//# sourceMappingURL=user.controller.js.map