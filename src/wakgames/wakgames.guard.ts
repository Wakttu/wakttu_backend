import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class WakgamesGuard implements CanActivate {
  constructor() {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.session.user;
    return user.provider === 'waktaverse.games';
  }
}
