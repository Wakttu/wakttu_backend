import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class SocketAuthenticatedGuard implements CanActivate {
    canActivate(context: ExecutionContext): Promise<any>;
}
