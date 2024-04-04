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
exports.RoomController = void 0;
const common_1 = require("@nestjs/common");
const room_service_1 = require("./room.service");
const create_room_dto_1 = require("./dto/create-room.dto");
const update_room_dto_1 = require("./dto/update-room.dto");
const swagger_1 = require("@nestjs/swagger");
const query_room_dto_1 = require("./dto/query-room.dto");
let RoomController = class RoomController {
    constructor(roomService) {
        this.roomService = roomService;
    }
    async create(createRoomDto) {
        return await this.roomService.create(createRoomDto);
    }
    async findById(id) {
        return await this.roomService.findById(id);
    }
    async update(id, updateRoomDto) {
        return await this.roomService.update(id, updateRoomDto);
    }
    async remove(id) {
        return await this.roomService.remove(id);
    }
    findByQuery(query) {
        const { title, start, option, take, skip } = query;
        return this.roomService.findByQuery(title, start, option, take, skip);
    }
};
exports.RoomController = RoomController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Room 생성' }),
    (0, swagger_1.ApiBody)({
        description: 'signup User',
        type: create_room_dto_1.CreateRoomDto,
    }),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_room_dto_1.CreateRoomDto]),
    __metadata("design:returntype", Promise)
], RoomController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'room 정보 얻기',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        type: 'string',
    }),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RoomController.prototype, "findById", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '방 설정 수정' }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        type: 'string',
    }),
    (0, swagger_1.ApiBody)({
        description: 'room 수정',
        type: update_room_dto_1.UpdateRoomDto,
    }),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_room_dto_1.UpdateRoomDto]),
    __metadata("design:returntype", Promise)
], RoomController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '방 삭제' }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        type: 'string',
    }),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RoomController.prototype, "remove", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '방정보 query로 검색' }),
    (0, swagger_1.ApiQuery)({
        description: 'query를 통해 검색',
        type: query_room_dto_1.QueryRoomDto,
    }),
    (0, common_1.Get)('query'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RoomController.prototype, "findByQuery", null);
exports.RoomController = RoomController = __decorate([
    (0, swagger_1.ApiTags)('Room'),
    (0, common_1.Controller)('room'),
    __metadata("design:paramtypes", [room_service_1.RoomService])
], RoomController);
//# sourceMappingURL=room.controller.js.map