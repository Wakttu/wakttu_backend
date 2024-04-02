import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class IsNotLoginedGuard implements CanActivate {
    canActivate(context: ExecutionContext): Promise<boolean>;
    checkUser(session: any): boolean;
}
