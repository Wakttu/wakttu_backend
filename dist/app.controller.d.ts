import { AppService } from './app.service';
import { Request } from 'express';
import { SocketService } from './socket/socket.service';
export declare class AppController {
    private readonly appService;
    private socketService;
    constructor(appService: AppService, socketService: SocketService);
    isLoggined(req: Request): any;
}
