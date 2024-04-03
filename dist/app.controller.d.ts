import { AppService } from './app.service';
import { SocketGateway } from './socket/socket.gateway';
export declare class AppController {
    private readonly appService;
    private readonly socketGateway;
    constructor(appService: AppService, socketGateway: SocketGateway);
    getHello(): string;
    test(): void;
}
