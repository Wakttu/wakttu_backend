import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class CloudflareGuard implements CanActivate {
    private client;
    constructor(config: ConfigService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private verifyToken;
    private getKey;
}
