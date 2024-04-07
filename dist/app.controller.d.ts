import { AppService } from './app.service';
import { Request } from 'express';
import { RoomService } from './room/room.service';
export declare class AppController {
    private readonly appService;
    private readonly roomService;
    constructor(appService: AppService, roomService: RoomService);
    isLoggined(req: Request): any;
    createRoom(req: Request): any;
}
