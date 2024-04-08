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
let SocketService = class SocketService {
    constructor(dic, room) {
        this.dic = dic;
        this.room = room;
    }
    async findWord(word) {
        return await this.dic.findById(word);
    }
    async getWord(length) {
        return await this.dic.getWord(length);
    }
    async createRoom(data) {
        return await this.room.create(data);
    }
};
exports.SocketService = SocketService;
exports.SocketService = SocketService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [dictionary_service_1.DictionaryService,
        room_service_1.RoomService])
], SocketService);
//# sourceMappingURL=socket.service.js.map