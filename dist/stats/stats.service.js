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
exports.StatsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let StatsService = class StatsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.typeHandlers = new Map([
            ['WOO', () => ['WOO-1']],
            ['INE', (word) => ['INE-1', ...(word.id === '오야' ? ['INE-2'] : [])]],
            [
                'JINGBURGER',
                (word) => [
                    'JING-1',
                    ...(word.meta?.tag.includes('어록') ? ['JING-2'] : []),
                ],
            ],
            ['LILPA', (word) => ['LIL-1', ...(word.id === '띨파' ? ['LIL-2'] : [])]],
            [
                'JURURU',
                (word) => [
                    'JU-1',
                    ...(word.id === '주폭도' || word.id === '주스단' || word.id === '려우'
                        ? ['JU-2']
                        : []),
                ],
            ],
            [
                'GOSEGU',
                (word) => [
                    'GO-1',
                    ...(word.meta?.tag.includes('콘텐츠') ? ['GO-2'] : []),
                ],
            ],
            [
                'VIICHAN',
                (word) => ['VIi-1', ...(word.id.includes('복숭아') ? ['VIi-2'] : [])],
            ],
            [
                'GOMEM',
                (word) => [
                    ...(word.meta?.tag.includes('고멤') ? ['GOM-1'] : []),
                    ...(word.meta?.tag.includes('아카데미') ? ['GOM-2'] : []),
                ],
            ],
        ]);
    }
    async getAchieve(userId) {
        try {
            const achieves = await this.prisma.achievements.findMany({
                where: { userId },
            });
            return { achieves };
        }
        catch (error) {
            throw new Error(`업적 조회 중 오류 발생: ${error.message}`);
        }
    }
    async createAchieve(id, userId) {
        try {
            return await this.prisma.achievements.create({
                data: {
                    id,
                    userId,
                },
            });
        }
        catch (error) {
            throw new Error(`업적 생성 중 오류 발생: ${error.message}`);
        }
    }
    async putResult(body, user) {
        try {
            const map = new Map();
            body.forEach((item) => {
                if (item.type !== 'WORD')
                    return;
                const statId = this.getId(item.word);
                if (statId.length === 0)
                    return;
                statId.forEach((id) => {
                    const count = map.get(id);
                    map.set(id, count ? count + 1 : 1);
                });
            });
            const _stats = [];
            let _achieves = [];
            for (const key of map.keys()) {
                const { stats, achieves } = await this.putStat(user.id, key, map.get(key));
                _stats.push(stats);
                _achieves = [..._achieves, ...achieves];
            }
            return { stats: _stats, achieves: _achieves };
        }
        catch (error) {
            throw new Error(`결과 처리 중 오류 발생: ${error.message}`);
        }
    }
    async putStat(userId, statId, incrementValue) {
        try {
            return await this.prisma.$transaction(async (tx) => {
                let currentStat = await tx.stats.findUnique({
                    where: { id_userId: { id: statId, userId } },
                });
                if (!currentStat) {
                    currentStat = await tx.stats.create({
                        data: {
                            id: statId,
                            userId,
                            value: 0,
                        },
                    });
                }
                const newStatValue = currentStat.value + incrementValue;
                const updatedStat = await tx.stats.update({
                    where: { id_userId: { id: statId, userId } },
                    data: { value: newStatValue },
                });
                const createAchieve = await this.checkAchievementsByStatId(tx, userId, statId, updatedStat.value);
                return { stats: updatedStat, achieves: createAchieve };
            });
        }
        catch (error) {
            throw new Error(`통계 업데이트 중 오류 발생: ${error.message}`);
        }
    }
    async checkAchievementsByStatId(tx, userId, statId, newValue) {
        try {
            const achievementConditions = {
                LAST_COUNT: [
                    {
                        threshold: 1,
                        id: 'WELCOME',
                    },
                ],
                'WOO-1': [
                    {
                        threshold: 100,
                        id: 'ITSME',
                    },
                ],
                'WOO-2': [
                    {
                        threshold: 10,
                        id: 'HAA',
                    },
                ],
                'INE-1': [
                    {
                        threshold: 100,
                        id: 'DULGI',
                    },
                ],
                'INE-2': [
                    {
                        threshold: 20,
                        id: 'OYA',
                    },
                ],
                'JING-1': [
                    {
                        threshold: 100,
                        id: 'GANGAJI',
                    },
                ],
                'JING-2': [
                    {
                        threshold: 20,
                        id: 'MOSIGGANG',
                    },
                ],
                'LIL-1': [
                    {
                        threshold: 10,
                        id: 'BABYBAT',
                    },
                    {
                        threshold: 100,
                        id: 'BAT',
                    },
                ],
                'LIL-2': [
                    {
                        threshold: 5,
                        id: 'DERPPA',
                    },
                ],
                'JU-1': [
                    {
                        threshold: 100,
                        id: 'POKDO',
                    },
                ],
                'JU-2': [
                    {
                        threshold: 5,
                        id: 'MOT',
                    },
                ],
                'GO-1': [
                    {
                        threshold: 100,
                        id: 'SEGYUN',
                    },
                ],
                'GO-2': [
                    {
                        threshold: 20,
                        id: 'YEOLSIM',
                    },
                ],
                'VIi-1': [
                    {
                        threshold: 100,
                        id: 'RANI',
                    },
                ],
                'VIi-2': [
                    {
                        threshold: 20,
                        id: 'PEACH',
                    },
                ],
                'GOMEM-1': [
                    {
                        threshold: 50,
                        id: 'GOMEM',
                    },
                ],
                'GOMEM-2': [
                    {
                        threshold: 50,
                        id: 'ACADEMY',
                    },
                ],
                WINSOL: [
                    {
                        threshold: 100,
                        id: 'IMSOLO',
                    },
                ],
                WINTEAM: [
                    {
                        threshold: 100,
                        id: 'MYTEAM',
                    },
                ],
                EXIT: [
                    {
                        threshold: 10,
                        id: 'ESCAPE',
                    },
                ],
                FILTER: [
                    {
                        threshold: 10,
                        id: 'MAID',
                    },
                ],
            };
            const conditions = achievementConditions[statId] || [];
            const achieve = [];
            for (const condition of conditions) {
                if (newValue >= condition.threshold) {
                    const achievementExists = await tx.achievements.findFirst({
                        where: {
                            id: condition.id,
                            userId,
                        },
                    });
                    if (!achievementExists) {
                        const res = await tx.achievements.create({
                            data: {
                                id: condition.id,
                                userId,
                            },
                        });
                        if (res)
                            achieve.push(res);
                    }
                }
            }
            return achieve;
        }
        catch (error) {
            throw new Error(`업적 확인 중 오류 발생: ${error.message}`);
        }
    }
    getId(word) {
        const handler = this.typeHandlers.get(word.type);
        return handler ? handler(word) : [];
    }
    async getRanks() {
        try {
            const results = await this.prisma.$transaction([
                this.prisma.user.findMany({
                    where: { provider: { notIn: ['manager', 'staff'] } },
                    orderBy: { score: 'desc' },
                    take: 10,
                    select: {
                        name: true,
                        score: true,
                    },
                }),
                this.prisma.stats.findMany({
                    where: {
                        id: 'WOO-1',
                        user: { provider: { notIn: ['manager', 'staff'] } },
                    },
                    orderBy: { value: 'desc' },
                    take: 10,
                    select: {
                        user: { select: { name: true, score: true } },
                        value: true,
                    },
                }),
                this.prisma.stats.findMany({
                    where: {
                        id: 'INE-1',
                        user: { provider: { notIn: ['manager', 'staff'] } },
                    },
                    orderBy: { value: 'desc' },
                    take: 10,
                    select: {
                        user: { select: { name: true, score: true } },
                        value: true,
                    },
                }),
                this.prisma.stats.findMany({
                    where: {
                        id: 'JING-1',
                        user: { provider: { notIn: ['manager', 'staff'] } },
                    },
                    orderBy: { value: 'desc' },
                    take: 10,
                    select: {
                        user: { select: { name: true, score: true } },
                        value: true,
                    },
                }),
                this.prisma.stats.findMany({
                    where: {
                        id: 'LIL-1',
                        user: { provider: { notIn: ['manager', 'staff'] } },
                    },
                    orderBy: { value: 'desc' },
                    take: 10,
                    select: {
                        user: { select: { name: true, score: true } },
                        value: true,
                    },
                }),
                this.prisma.stats.findMany({
                    where: {
                        id: 'JU-1',
                        user: { provider: { notIn: ['manager', 'staff'] } },
                    },
                    orderBy: { value: 'desc' },
                    take: 10,
                    select: {
                        user: { select: { name: true, score: true } },
                        value: true,
                    },
                }),
                this.prisma.stats.findMany({
                    where: {
                        id: 'GO-1',
                        user: { provider: { notIn: ['manager', 'staff'] } },
                    },
                    orderBy: { value: 'desc' },
                    take: 10,
                    select: {
                        user: { select: { name: true, score: true } },
                        value: true,
                    },
                }),
                this.prisma.stats.findMany({
                    where: {
                        id: 'VIi-1',
                        user: { provider: { notIn: ['manager', 'staff'] } },
                    },
                    orderBy: { value: 'desc' },
                    take: 10,
                    select: {
                        user: { select: { name: true, score: true } },
                        value: true,
                    },
                }),
            ]);
            return {
                userRanks: results[0],
                wooRanks: results[1],
                ineRanks: results[2],
                jingRanks: results[3],
                lilRancks: results[4],
                juRanks: results[5],
                goRanks: results[6],
                viRanks: results[7],
            };
        }
        catch (error) {
            throw new Error(`랭킹 확인 중 오류 발생: ${error.message}`);
        }
    }
};
exports.StatsService = StatsService;
exports.StatsService = StatsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StatsService);
//# sourceMappingURL=stats.service.js.map