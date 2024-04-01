import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    clients: {
        [socketId: string]: string;
    };
    handleConnection(client: Socket): void;
    afterInit(): void;
    handleDisconnect(client: Socket): void;
    handleMessage(data: string, client: Socket): void;
    handleDM(data: string, client: Socket): void;
    handleEnter(roomId: string, client: Socket): void;
    handleExit(roomId: string, client: Socket): void;
    handleStatus(): void;
}
