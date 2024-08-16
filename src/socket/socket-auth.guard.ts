import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class SocketAuthenticatedGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}
  async canActivate(context: ExecutionContext) {
    const client = context.switchToWs().getClient();
    return await this.checkUser(client);
  }

  async checkUser(client) {
    const session = client.request.session;
    if (!Object.keys(session).includes('user')) return false;
    return await this.checkBan(session.user.id, client.handshake.address);
  }

  async checkBan(userId: string, ip: string) {
    const res = await this.prisma.ban.findFirst({
      where: {
        OR: [{ userId }, { ip }],
      },
    });
    return res ? false : true;
  }
}
