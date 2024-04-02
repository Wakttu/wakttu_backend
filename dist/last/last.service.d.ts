import { Room } from 'src/room/entities/room.entity';
import { Game, SocketGateway } from 'src/socket/socket.gateway';
import { SocketService } from 'src/socket/socket.service';
export declare class LastService {
    private socketGateway;
    private readonly socketService;
    constructor(socketGateway: SocketGateway, socketService: SocketService);
    server: any;
    handleStart(roomId: string, roomInfo: Room, game: Game): Promise<void>;
    handleRound(roomId: string, roomInfo: Room, game: Game): Promise<void>;
    handleCheckMission(chat: string, game: Game): Promise<boolean>;
    handleGetMission(): Promise<string>;
    handleNextTurn(game: Game, keyword: string, score: number): void;
    handleTurnEnd(game: Game): Promise<void>;
    handleCheck(word: string, target: string): {
        success: boolean;
        message: string;
    };
}
