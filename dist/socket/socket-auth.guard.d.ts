import { PrismaService } from 'src/prisma/prisma.service';
export declare class SocketAuthenticatedGuard {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    validateClient(client: any): Promise<boolean>;
    private checkBan;
    private getRealClientIp;
}
