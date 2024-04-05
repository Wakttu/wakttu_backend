import { AppService } from './app.service';
import { SocketGateway } from './socket/socket.gateway';
import { Request } from 'express';
export declare class AppController {
    private readonly appService;
    private readonly socketGateway;
    constructor(appService: AppService, socketGateway: SocketGateway);
    isLoggined(req: Request): any;
    test(req: any): void;
}
