import { Room } from 'src/room/entities/room.entity';
import { Game, SocketGateway } from 'src/socket/socket.gateway';
import { SocketService } from 'src/socket/socket.service';
export declare class BellService {
    private readonly socketGateway;
    private readonly socketService;
    constructor(socketGateway: SocketGateway, socketService: SocketService);
    server: any;
    answer: {
        [roomId: string]: string[];
    };
    handleStart(roomId: string, roomInfo: Room, game: Game): Promise<void>;
    handleRound(roomId: string, roomInfo: Room, game: Game): Promise<void>;
    getCombinations(len: number): any[];
    handleAnswer(idx: number, game: Game, score: number): void;
}
