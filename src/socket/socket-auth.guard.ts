import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class SocketAuthenticatedGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const client = context.switchToWs().getClient();
    const request = client.request;
    client.user = request.session.user;
    console.log(request.session);
    return this.checkUser(request.session);
  }

  checkUser(session) {
    return session.user ? true : false;
  }
}
