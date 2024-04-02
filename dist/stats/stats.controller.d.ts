import { StatsService } from './stats.service';
export declare class StatsController {
    private readonly stats;
    constructor(stats: StatsService);
    getAchieve(session: Record<string, any>): Promise<{
        achieves: {
            id: string;
            userId: string;
            createdAt: Date;
        }[];
    }>;
    createAchieve(id: any, session: Record<string, any>): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
    }>;
    putStat(body: any, session: Record<string, any>): Promise<{
        stats: {
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            value: number;
        };
        achieves: any[];
    }>;
    putResult(body: any, session: Record<string, any>): Promise<{
        stats: any[];
        achieves: any[];
    }>;
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
