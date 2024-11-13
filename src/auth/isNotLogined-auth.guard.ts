import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class IsNotLoginedGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const check = this.checkUser(request.session);
    if (!check) throw new ForbiddenException({ message: '로그인 중 입니다!' });
    return true;
  }
  checkUser(session) {
    return session.user ? false : true;
  }
}
