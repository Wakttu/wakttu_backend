import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketService } from './socket.service';
import { CreateRoomDto } from 'src/room/dto/create-room.dto';
import { Room } from 'src/room/entities/room.entity';
interface Chat {
    roomId: string;
    chat: string;
}
declare class Game {
    constructor();
    host: string;
    type: number;
    round: number;
    turn: number;
    total: number;
    users: string[];
    keyword: string;
    target: string;
}
export declare class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly socketService;
    constructor(socketService: SocketService);
    server: Server;
    user: {
        [socketId: string]: any;
    };
    roomInfo: {
        [roomId: string]: Room;
    };
    game: {
        [roomId: string]: Game;
    };
    handleConnection(client: any): void;
    afterInit(): Promise<void>;
    handleDisconnect(client: any): Promise<void>;
    handleAlarm(message: string): void;
    handleRoomList(client: Socket): Promise<void>;
    handleMessage({ roomId, chat }: Chat, client: Socket): Promise<void>;
    handleCreate(data: CreateRoomDto, client: any): Promise<void>;
    handleEnter({ roomId, password }: {
        roomId: any;
        password: any;
    }, client: any): Promise<void>;
    handleExit(roomId: string, client: Socket): Promise<void>;
    handleReady(roomId: string, client: Socket): void;
    handleStart(roomId: string, client: Socket): Promise<void>;
    handleRound(roomId: string): void;
    handleAnswer({ roomId, chat }: Chat): Promise<void>;
    handleInfo(client: Socket): void;
}
export {};
