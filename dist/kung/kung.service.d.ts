import { Room } from 'src/room/entities/room.entity';
import { Game, SocketGateway } from 'src/socket/socket.gateway';
import { SocketService } from 'src/socket/socket.service';
declare class Rule {
    constructor(count?: number);
    ban: string[];
}
export declare class KungService {
    private readonly socketGateway;
    private readonly socketService;
    constructor(socketGateway: SocketGateway, socketService: SocketService);
    server: any;
    rules: {
        [roomId: string]: Rule;
    };
    handleStart(roomId: string, roomInfo: Room, game: Game): Promise<void>;
    handleRound(roomId: string, roomInfo: Room, game: Game): Promise<void>;
    handleNextTurn(game: Game, keyword: string, score: number): void;
    handleTurnEnd(game: Game): void;
    handleCheck(word: string, target: string, length: number): {
        success: boolean;
        message: string;
    };
}
export {};
