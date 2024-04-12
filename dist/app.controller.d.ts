import { AppService } from './app.service';
import { Request } from 'express';
import { RoomService } from './room/room.service';
import { SocketGateway } from './socket/socket.gateway';
export declare class AppController {
    private readonly appService;
    private readonly roomService;
    private readonly socket;
    constructor(appService: AppService, roomService: RoomService, socket: SocketGateway);
    isLoggined(req: Request): any;
}
