import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class LocalAuthenticatedGuard implements CanActivate {
    canActivate(context: ExecutionContext): Promise<boolean>;
    checkBody(body: any): boolean;
}
