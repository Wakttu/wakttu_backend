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
exports.RoomService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RoomService = class RoomService {
    constructor(prisma) {
        this.prisma = prisma;
        this.idx = 0;
    }
    async create(data) {
        try {
            const _data = { ...data, idx: this.idx++ };
            this.idx %= 1000;
            return this.prisma.room.create({
                data: _data,
                include: {
                    users: {
                        select: {
                            id: true,
                            name: true,
                            character: true,
                            score: true,
                            keyboard: true,
                            provider: true,
                        },
                    },
                },
            });
        }
        catch (error) {
            throw new common_1.BadRequestException('방 생성에 실패했습니다.');
        }
    }
    async findByQuery(title = undefined, start = undefined, option = [], take = undefined, skip = 0) {
        try {
            return await this.prisma.room.findMany({
                take,
                skip,
                where: {
                    title: { contains: title },
                    start,
                    option: { hasEvery: option },
                },
                include: {
                    users: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });
        }
        catch (error) {
            throw new common_1.BadRequestException('방 검색 중 오류가 발생했습니다.');
        }
    }
    async findAll() {
        try {
            return await this.prisma.room.findMany({
                include: {
                    users: {
                        select: { id: true, name: true },
                    },
                },
            });
        }
        catch (error) {
            throw new common_1.BadRequestException('방 목록을 가져오는 중 오류가 발생했습니다.');
        }
    }
    async findById(id) {
        try {
            return await this.prisma.room.findUnique({
                where: { id },
                include: {
                    users: {
                        select: {
                            id: true,
                            name: true,
                            character: true,
                            score: true,
                            keyboard: true,
                            provider: true,
                        },
                    },
                },
            });
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException)
                throw error;
            throw new common_1.BadRequestException('방을 찾는 중 오류가 발생했습니다.');
        }
    }
    async update(id, data) {
        try {
            return this.prisma.room.update({
                where: { id },
                data,
                include: {
                    users: {
                        select: {
                            id: true,
                            name: true,
                            character: true,
                            score: true,
                            keyboard: true,
                            provider: true,
                        },
                    },
                },
            });
        }
        catch (error) {
            throw new common_1.BadRequestException(`ID ${id}인 방 업데이트에 실패했습니다.`);
        }
    }
    async setStart(id, start) {
        try {
            return await this.prisma.room.update({
                where: { id },
                data: {
                    start: {
                        set: start,
                    },
                },
                include: {
                    users: {
                        select: {
                            id: true,
                            name: true,
                            character: true,
                            score: true,
                            keyboard: true,
                            provider: true,
                        },
                    },
                },
            });
        }
        catch (error) {
            throw new common_1.BadRequestException(`게임 시작 상태 변경 중 오류가 발생했습니다.`);
        }
    }
    async remove(id) {
        try {
            return await this.prisma.room.deleteMany({ where: { id } });
        }
        catch (error) {
            throw new common_1.BadRequestException(`방 삭제 중 오류가 발생했습니다.`);
        }
    }
    async removeAll() {
        try {
            return await this.prisma.room.deleteMany();
        }
        catch (error) {
            throw new common_1.BadRequestException('전체 방 삭제 중 오류가 발생했습니다.');
        }
    }
    async checkPassword(roomId, password) {
        try {
            const room = await this.prisma.room.findUnique({
                where: { id: roomId, password },
            });
            return !!room;
        }
        catch (error) {
            throw new common_1.BadRequestException('비밀번호 확인 중 오류가 발생했습니다.');
        }
    }
};
exports.RoomService = RoomService;
exports.RoomService = RoomService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RoomService);
//# sourceMappingURL=room.service.js.map