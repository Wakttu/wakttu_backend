import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class WakgamesGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const requset = context.switchToHttp().getRequest();
    return this.checkUser(requset.session);
  }

  checkUser(session) {
    const user = session.user;
    return user.provider === 'waktaverse.games';
  }
}
