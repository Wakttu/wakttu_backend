import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class WakgamesGuard implements CanActivate {
    constructor();
    canActivate(context: ExecutionContext): Promise<boolean>;
}
