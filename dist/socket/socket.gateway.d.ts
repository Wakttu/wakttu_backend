import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketService } from './socket.service';
import { CreateRoomDto } from 'src/room/dto/create-room.dto';
import { Room } from 'src/room/entities/room.entity';
interface Chat {
    roomId: string;
    chat: string;
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
    turn: {
        [roomId: string]: string;
    };
    handleConnection(client: any): void;
    afterInit(): Promise<void>;
    handleDisconnect(client: any): Promise<void>;
    handleAlarm(message: string): void;
    handleRoomList(client: Socket): Promise<void>;
    handleMessage({ roomId, chat }: Chat, client: Socket): Promise<void>;
    handleCreate(data: CreateRoomDto, client: any): Promise<void>;
    handleEnter(roomId: string, client: any): Promise<void>;
    handleExit(roomId: string, client: Socket): Promise<void>;
    handleReady(roomId: string): Promise<void>;
    handleAnswer({ roomId, chat }: Chat, client: Socket): Promise<void>;
}
export {};
