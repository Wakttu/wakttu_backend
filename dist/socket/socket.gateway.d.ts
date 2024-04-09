import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketService } from './socket.service';
interface Chat {
    roomId: string;
    chat: string;
}
export declare class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly socketService;
    constructor(socketService: SocketService);
    server: Server;
    clients: {
        [socketId: string]: string;
    };
    roomUser: {
        [roomId: string]: string[];
    };
    roomInfo: {
        [roomId: string]: {
            title: string;
            type: string;
            users: any;
            option: string[];
            host: string | undefined;
            round: number;
            word: string;
            password: string;
        };
    };
    turn: {
        [roomId: string]: string;
    };
    handleConnection(client: any): void;
    afterInit(): void;
    handleDisconnect(client: Socket): void;
    handleAlarm(message: string): void;
    handleMessage({ roomId, chat }: Chat, client: Socket): Promise<void>;
    handleEnter(roomId: string, client: Socket): Promise<void>;
    handleExit(roomId: string, client: Socket): void;
    handleReady(roomId: string): Promise<void>;
    handleAnswer({ roomId, chat }: Chat, client: Socket): Promise<void>;
}
export {};
