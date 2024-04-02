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
        try {
            return await this.prisma.dictionary.create({ data });
        }
        catch (error) {
            throw new Error(`단어 생성 중 오류 발생: ${error.message}`);
        }
    }
    async findById(id) {
        try {
            return await this.prisma.dictionary.findUnique({
                where: { id },
            });
        }
        catch (error) {
            throw new Error(`단어 검색 중 오류 발생: ${error.message}`);
        }
    }
    async findAll(id) {
        return await this.prisma.dictionary.findMany({
            where: {
                id: { startsWith: id },
            },
            take: 10,
        });
    }
    async update(id, data) {
        return await this.prisma.dictionary.update({
            where: { id },
            data,
        });
    }
    async remove(id) {
        return await this.prisma.dictionary.delete({ where: { id } });
    }
    async getWord(length) {
        try {
            const list = await this.prisma
                .$queryRaw `SELECT _id FROM "public"."wakttu_ko" WHERE LENGTH(_id) = ${length} AND wakta = true ORDER BY random() LIMIT 1`;
            let isMannerSafe = true;
            list[0]['_id'].split('').map(async (word) => {
                isMannerSafe = await this.checkManner(word);
            });
            if (isMannerSafe) {
                return list[0];
            }
            return '우리모두품어놀자'.slice(0, length);
        }
        catch (error) {
            throw new Error(`단어 가져오기 중 오류 발생: ${error.message}`);
        }
    }
    async checkManner(keyword) {
        try {
            const res = await this.prisma.manner.findUnique({
                where: { id: keyword },
            });
            return !!res;
        }
        catch (error) {
            throw new Error(`매너 검사 중 오류 발생: ${error.message}`);
        }
    }
    async getMission() {
        const list = await this.prisma
            .$queryRaw `SELECT _id FROM "public"."wakttu_mission" ORDER BY random() LIMIT 1`;
        return list[0]['_id'];
    }
    async search(keyword, take = 20, skip = 0) {
        return await this.prisma.dictionary.findMany({
            where: {
                id: { startsWith: keyword },
            },
            take: take,
            skip: skip,
            orderBy: { wakta: 'desc' },
        });
    }
    async todayWord() {
        const list = await this.prisma
            .$queryRaw `SELECT * FROM "public"."wakttu_ko" WHERE wakta = true ORDER BY random() LIMIT 1`;
        return list[0];
    }
    async getQuiz(round) {
        const list = await this.prisma
            .$queryRaw `SELECT * FROM "public"."wakttu_quiz" WHERE LENGTH(_id) BETWEEN 3 AND 10 ORDER BY random() LIMIT ${round}`;
        return list;
    }
};
exports.DictionaryService = DictionaryService;
exports.DictionaryService = DictionaryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DictionaryService);
//# sourceMappingURL=dictionary.service.js.map