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
    try {
      const session = client.request.session;

      if (!session) {
        console.log('Socket connection rejected: No session found');
        return false;
      }

      if (!session.user?.id) {
        console.log('Socket connection rejected: Invalid user data');
        return false;
      }

      const isBanned = await this.checkBan(
        session.user.id,
        client.handshake.address,
      );
      if (!isBanned) {
        console.log(
          `Socket connection rejected: User ${session.user.id} is banned`,
        );
      }

      return isBanned;
    } catch (error) {
      console.error('Socket authentication error:', error);
      return false;
    }
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
