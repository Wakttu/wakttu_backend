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
exports.DictionaryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DictionaryService = class DictionaryService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return await this.prisma.kkutu_ko.create({ data });
    }
    async findById(id) {
        return await this.prisma.kkutu_ko.findUnique({
            where: { id },
        });
    }
    async update(id, data) {
        return await this.prisma.kkutu_ko.update({
            where: { id },
            data,
        });
    }
    async remove(id) {
        return await this.prisma.kkutu_ko.delete({ where: { id } });
    }
    async getWord(length) {
        const list = await this.prisma
            .$queryRaw `SELECT * FROM "public"."kkutu_ko" WHERE LENGTH(_id) =${length} LIMIT 10000`;
        let idx;
        if (list.length < 10000) {
            idx = Math.floor(Math.random() * list.length);
        }
        else {
            idx = Math.floor(Math.random() * 10000);
        }
        return list[idx];
    }
};
exports.DictionaryService = DictionaryService;
exports.DictionaryService = DictionaryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DictionaryService);
//# sourceMappingURL=dictionary.service.js.map