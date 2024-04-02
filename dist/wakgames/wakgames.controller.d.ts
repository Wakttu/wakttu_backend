import { WakgamesService } from './wakgames.service';
export declare class WakgamesController {
    private readonly wakgamesService;
    constructor(wakgamesService: WakgamesService);
    getProfile(session: Record<string, any>): any;
    getAchieve(session: Record<string, any>): any;
    postAchieve(query: any, session: Record<string, any>): any;
    getStat(query: any, session: Record<string, any>): any;
    putStat(body: any, session: Record<string, any>): any;
    putResult(body: any, session: Record<string, any>): Promise<any>;
}
