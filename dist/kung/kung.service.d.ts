import { SocketGateway } from 'src/socket/socket.gateway';
export declare class KungService {
    private readonly socketGateway;
    constructor(socketGateway: SocketGateway);
    server: any;
}
