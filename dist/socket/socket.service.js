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
    async reloadUser(id) {
        const data = await this.userService.findById(id);
        if (data.password) {
            const { password, ...res } = data;
            return res;
        }
        return data;
    }
    async findWord(word) {
        try {
            return await this.dicService.findById(word);
        }
        catch (error) {
            throw new Error('단어 검색 중 오류가 발생했습니다: ' + error.message);
        }
    }
    async setWord(length) {
        return await this.dicService.getWord(length);
    }
    async getQuiz(round) {
        return await this.dicService.getQuiz(round);
    }
    async createRoom(userId, data) {
        try {
            const room = await this.roomService.create(data);
            return await this.userService.roomCreate(userId, room.id);
        }
        catch (error) {
            throw new Error('방 생성 중 오류가 발생했습니다: ' + error.message);
        }
    }
    async updateRoom(roomId, data) {
        return await this.roomService.update(roomId, data);
    }
    async deleteRoom(roomId) {
        await this.roomService.remove(roomId);
    }
    async deleteAllRoom() {
        await this.roomService.removeAll();
    }
    async enterRoom(userId, roomId) {
        try {
            return await this.userService.enter(userId, roomId);
        }
        catch (error) {
            throw new Error('방 입장 중 오류가 발생했습니다: ' + error.message);
        }
    }
    async exitRoom(userId) {
        await this.userService.exit(userId);
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
    async getRoomList() {
        return await this.roomService.findAll();
    }
    async getRoom(roomId) {
        return await this.roomService.findById(roomId);
    }
    async setStart(roomId, start) {
        return await this.roomService.setStart(roomId, !start);
    }
    async checkPassword(roomId, password) {
        return await this.roomService.checkPassword(roomId, password);
    }
    shuffle(game) {
        const arr = game.users;
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        game.users = arr;
    }
    teamShuffle(game, team) {
        const { woo, gomem, academy, isedol } = team;
        for (let i = woo.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [woo[i], woo[j]] = [woo[j], woo[i]];
        }
        for (let i = gomem.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [gomem[i], gomem[j]] = [gomem[j], gomem[i]];
        }
        for (let i = academy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [academy[i], academy[j]] = [academy[j], academy[i]];
        }
        for (let i = isedol.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [isedol[i], isedol[j]] = [isedol[j], isedol[i]];
        }
        const keys = [woo, gomem, academy, isedol];
        for (let i = 3; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [keys[i], keys[j]] = [keys[j], keys[i]];
        }
        const count = Math.max(woo.length, gomem.length, academy.length, isedol.length);
        const arr = [];
        for (let i = 0; i < count; i++) {
            for (let j = 0; j < 4; j++) {
                if (keys[j].length > 0) {
                    const idx = game.users.findIndex((user) => user.userId === keys[j][i]);
                    arr.push(game.users[idx]);
                }
            }
        }
        game.users = arr;
    }
    async getMission() {
        return await this.dicService.getMission();
    }
    async checkManner(keyword) {
        const flag = await this.dicService.checkManner(keyword);
        if (flag)
            return true;
        return false;
    }
    checkWakta(wakta) {
        return wakta === true;
    }
    checkPoom(type) {
        return type === 'POOM';
    }
    checkInjeong(type) {
        return type === 'INJEONG';
    }
    getOption(option) {
        const flag = [false, false, false, false];
        if (option.includes('매너')) {
            flag[0] = true;
        }
        if (option.includes('외수')) {
            flag[1] = true;
        }
        if (option.includes('팀전')) {
            flag[2] = true;
        }
        if (option.includes('품어')) {
            flag[3] = true;
        }
        return flag;
    }
    async checkOption(option, keyword, type) {
        if (option[0]) {
            const flag0 = await this.checkManner(keyword);
            if (!flag0)
                return { success: false, message: '2' };
        }
        if (!option[3]) {
            const flag1 = this.checkPoom(type);
            if (flag1)
                return { success: false, message: '4' };
        }
        if (!option[1]) {
            const flag2 = this.checkInjeong(type);
            if (flag2)
                return { success: false, message: '3' };
        }
        return { success: true, message: '0' };
    }
    async check(_word, option) {
        const word = await this.findWord(_word);
        if (!word)
            return { success: false, message: '1' };
        const { success, message } = await this.checkOption(option, word.id.slice(-1), word.type);
        return { success, message, word };
    }
    getColor() {
        let randomHex = Math.floor(Math.random() * 0xffffff).toString(16);
        randomHex = `#${randomHex.padStart(6, '0')}`;
        return randomHex;
    }
    getTurnTime(roundTime, chain = 1) {
        if (chain >= 20 && chain < 30) {
            return Math.min(roundTime, 3000);
        }
        else if (chain >= 30 && chain < 40) {
            return Math.min(roundTime, 1000);
        }
        else if (chain >= 40) {
            return Math.min(roundTime, 700);
        }
        else {
            const speed = chain <= 10 ? chain : 10;
            return Math.min(roundTime, 20000 - 1500 * (speed - 1));
        }
    }
    async setResult(users) {
        return await this.userService.updateResult(users);
    }
    async deleteGuest(id) {
        await this.userService.deleteGuest(id);
    }
    async getFail(target) {
        const data = await this.dicService.search(target, 1, 0);
        if (data.length > 0)
            return data[0].id;
        return '한방!';
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