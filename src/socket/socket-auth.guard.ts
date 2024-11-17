import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SocketAuthenticatedGuard {
  private readonly logger = new Logger(SocketAuthenticatedGuard.name);

  constructor(private readonly prisma: PrismaService) {}

  async validateClient(client: any): Promise<boolean> {
    try {
      const session = client.request?.session;

      if (!session) {
        this.logger.warn('Socket connection rejected: No session found');
        return false;
      }

      if (!session.user?.id) {
        this.logger.warn('Socket connection rejected: Invalid user data');
        return false;
      }

      const ip = this.getRealClientIp(client);
      this.logger.log(
        `Client attempting connection: UserID=${session.user.id}, IP=${ip}`,
      );

      const isAllowed = await this.checkBan(session.user.id, ip);

      if (!isAllowed) {
        this.logger.warn(
          `Socket connection rejected: User ${session.user.id} (IP: ${ip}) is banned.`,
        );
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error('Socket authentication error', error.stack);
      return false;
    }
  }

  private async checkBan(userId: string, ip: string): Promise<boolean> {
    const res = await this.prisma.ban.findFirst({
      where: {
        OR: [{ userId }, { ip }],
      },
    });

    if (res) {
      this.logger.log(`Ban record found for UserID=${userId}, IP=${ip}`);
      return false;
    }

    this.logger.log(`No ban record for UserID=${userId}, IP=${ip}`);
    return true;
  }

  private getRealClientIp(client): string {
    const headers = client.handshake.headers;
    let ip = client.handshake.address;

    if (headers['cf-connecting-ip']) {
      ip = headers['cf-connecting-ip'];
    } else if (headers['x-forwarded-for']) {
      ip = headers['x-forwarded-for'].split(',')[0].trim();
    }

    return ip;
  }
}
