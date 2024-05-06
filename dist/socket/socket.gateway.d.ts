import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketService } from './socket.service';
import { CreateRoomDto } from 'src/room/dto/create-room.dto';
import { Room } from 'src/room/entities/room.entity';
import { KungService } from 'src/kung/kung.service';
interface Chat {
    roomId: string;
    chat: string;
}
export declare class Game {
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
    private readonly kungService;
    private readonly socketService;
    constructor(kungService: KungService, socketService: SocketService);
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
        roomId: string;
        password: string;
    }, client: any): Promise<void>;
    handleExit(roomId: string, client: Socket): Promise<void>;
    handleKick({ roomId, userId }: {
        roomId: string;
        userId: string;
    }, client: Socket): void;
    hanldeKickHelper(roomId: string, client: Socket): Promise<void>;
    handleReady(roomId: string, client: Socket): void;
    handleStart(roomId: string, client: Socket): Promise<void>;
    handleAnswer({ roomId, chat }: Chat): Promise<void>;
    handleInfo(client: Socket): void;
    handleKungStart(roomId: string, client: Socket): Promise<void>;
    handleKungRound(roomId: string): void;
    handleKungAnswer({ roomId, chat }: {
        roomId: string;
        chat: string;
    }): Promise<void>;
    handleKungBan({ roomId, keyword }: {
        roomId: string;
        keyword: string;
    }, client: any): void;
}
export {};
