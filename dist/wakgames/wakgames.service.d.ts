import { ConfigService } from '@nestjs/config';
import { WakGames } from '@wakgames/backend-sdk';
export type stats = {
    id: string;
    val: number;
}[];
interface WordData {
    type: string;
    id: string;
    meta?: {
        tag: string[];
    };
    [key: string]: any;
}
export declare class WakgamesService extends WakGames {
    private readonly configService;
    constructor(configService: ConfigService);
    getAuth(): object;
    getToken(auth: any): Promise<any>;
    updateToken(refreshToken: string): Promise<any>;
    getProfile(accessToken: string): Promise<any>;
    getAchieve(accessToken: string): Promise<any>;
    postAchieve(query: any, accessToken: string): Promise<any>;
    getStat(query: any, accessToken: string): Promise<any>;
    putStat(body: any, accessToken: string): Promise<any>;
    private refreshTokenIfNeeded;
    putResult(body: [], session: Record<string, any>): Promise<any>;
    private readonly typeHandlers;
    getId(word: WordData): string[];
}
export {};
