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
exports.SocketService = void 0;
const common_1 = require("@nestjs/common");
const dictionary_service_1 = require("../dictionary/dictionary.service");
const room_service_1 = require("../room/room.service");
const user_service_1 = require("../user/user.service");
const common_2 = require("@nestjs/common");
let SocketService = class SocketService {
    constructor(dicService, roomService, userService) {
        this.dicService = dicService;
        this.roomService = roomService;
        this.userService = userService;
    }
    async findWord(word) {
        return await this.dicService.findById(word);
    }
    async getWord(length) {
        return await this.dicService.getWord(length);
    }
    async createRoom(roomId, data, user) {
        await this.roomService.create(data);
        return await this.userService.enter(user.id, roomId);
    }
    async test(req) {
        return req;
    }
};
exports.SocketService = SocketService;
__decorate([
    __param(0, (0, common_2.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Request]),
    __metadata("design:returntype", Promise)
], SocketService.prototype, "test", null);
exports.SocketService = SocketService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [dictionary_service_1.DictionaryService,
        room_service_1.RoomService,
        user_service_1.UserService])
], SocketService);
//# sourceMappingURL=socket.service.js.map