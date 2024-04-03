import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
interface Data {
    roomId: string | string[];
    message: string;
}
export declare class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    clients: {
        [socketId: string]: string;
    };
    handleConnection(client: Socket): void;
    afterInit(): void;
    handleDisconnect(client: Socket): void;
    handleMessage({ roomId, message }: Data): void;
    handleEnter(roomId: string, client: Socket): void;
    handleExit(roomId: string, client: Socket): void;
    handleStatus(client: Socket): void;
}
export {};
