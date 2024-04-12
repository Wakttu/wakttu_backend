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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketService = void 0;
const common_1 = require("@nestjs/common");
const dictionary_service_1 = require("../dictionary/dictionary.service");
const room_service_1 = require("../room/room.service");
const user_service_1 = require("../user/user.service");
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
    async createRoom(userId, data) {
        const room = await this.roomService.create(data);
        return await this.userService.enter(userId, room.id);
    }
    async deleteRoom(roomId) {
        return await this.roomService.remove(roomId);
    }
    async deleteAllRoom() {
        await this.roomService.removeAll();
    }
    async enterRoom(userId, roomId) {
        return await this.userService.enter(userId, roomId);
    }
    async exitRoom(userId) {
        return await this.userService.exit(userId);
    }
    async strongExitRoom(userId) {
        const response = await this.userService.findById(userId);
        const roomId = response.roomId;
        const room = await this.roomService.findById(roomId);
        if (room.users.length > 1) {
            return await this.userService.exit(userId);
        }
        else {
            return await this.roomService.remove(roomId);
        }
    }
    async getRoomList(title = undefined, start = false, option = undefined, take = 6, skip = 0) {
        return await this.roomService.findByQuery(title, start, option, take, skip);
    }
    async getRoom(roomId) {
        return await this.roomService.findById(roomId);
    }
};
exports.SocketService = SocketService;
exports.SocketService = SocketService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [dictionary_service_1.DictionaryService,
        room_service_1.RoomService,
        user_service_1.UserService])
], SocketService);
//# sourceMappingURL=socket.service.js.map