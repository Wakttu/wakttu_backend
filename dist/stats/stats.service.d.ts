import { PrismaService } from 'src/prisma/prisma.service';
export declare class StatsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getAchieve(userId: string): Promise<{
        achieves: {
            id: string;
            userId: string;
            createdAt: Date;
        }[];
    }>;
    createAchieve(id: string, userId: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
    }>;
    putResult(body: [], user: any): Promise<{
        stats: any[];
        achieves: any[];
    }>;
    putStat(userId: string, statId: string, incrementValue: number): Promise<{
        stats: {
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            value: number;
        };
        achieves: any[];
    }>;
    checkAchievementsByStatId(tx: any, userId: string, statId: string, newValue: number): Promise<any[]>;
    private readonly typeHandlers;
    getId(word: {
        type: string;
        id: string;
        meta?: {
            tag: string[];
        };
        [x: string]: any;
    }): string[];
    getRanks(): Promise<{
        userRanks: {
            name: string;
            score: number;
        }[];
        wooRanks: {
            user: {
                name: string;
                score: number;
            };
            value: number;
        }[];
        ineRanks: {
            user: {
                name: string;
                score: number;
            };
            value: number;
        }[];
        jingRanks: {
            user: {
                name: string;
                score: number;
            };
            value: number;
        }[];
        lilRancks: {
            user: {
                name: string;
                score: number;
            };
            value: number;
        }[];
        juRanks: {
            user: {
                name: string;
                score: number;
            };
            value: number;
        }[];
        goRanks: {
            user: {
                name: string;
                score: number;
            };
            value: number;
        }[];
        viRanks: {
            user: {
                name: string;
                score: number;
            };
            value: number;
        }[];
    }>;
}
