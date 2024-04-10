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
    }
    async create(data) {
        return await this.prisma.room.create({
            data,
            select: {
                id: true,
                title: true,
                type: true,
                round: true,
                option: true,
                count: true,
                start: true,
                createdAt: true,
                updatedAt: true,
                users: {
                    select: { id: true, name: true },
                },
            },
        });
    }
    async findByQuery(title = undefined, start = false, option = [], take = 6, skip = 0) {
        return await this.prisma.room.findMany({
            take,
            skip,
            where: {
                title: { contains: title },
                start,
                option: { hasEvery: option },
            },
            select: {
                id: true,
                title: true,
                type: true,
                round: true,
                option: true,
                count: true,
                start: true,
                createdAt: true,
                updatedAt: true,
                users: {
                    select: { id: true, name: true },
                },
            },
        });
    }
    async findById(id) {
        return await this.prisma.room.findUnique({
            where: { id },
            select: {
                id: true,
                title: true,
                type: true,
                round: true,
                option: true,
                count: true,
                start: true,
                createdAt: true,
                updatedAt: true,
                users: {
                    select: { id: true, name: true },
                },
            },
        });
    }
    async update(id, data) {
        return await this.prisma.room.update({
            where: { id },
            data,
            select: {
                id: true,
                title: true,
                type: true,
                round: true,
                option: true,
                count: true,
                start: true,
                createdAt: true,
                updatedAt: true,
                users: {
                    select: { id: true, name: true },
                },
            },
        });
    }
    async remove(id) {
        return await this.prisma.room.delete({ where: { id } });
    }
    async removeAll() {
        return await this.prisma.room.deleteMany();
    }
};
exports.RoomService = RoomService;
exports.RoomService = RoomService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RoomService);
//# sourceMappingURL=room.service.js.map