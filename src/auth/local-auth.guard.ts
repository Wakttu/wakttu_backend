import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class LocalAuthenticatedGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const check = this.checkBody(request.body);
    return check;
  }

  checkBody(body): boolean {
    if (!body.email || !body.password) return false;
    return true;
  }
}
