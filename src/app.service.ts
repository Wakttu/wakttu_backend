import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { UserService } from './user/user.service';
@Injectable()
export class AppService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }

  async getAchieve() {
    return await this.prisma.achieve.findMany({});
  }

  async findUser(user: any) {
    if (!user || !user.id) return { status: 400, message: 'Not session' };
    const data = await this.userService.findById(user.id);
    return { status: !!data, message: 'user 정보 확인', user: data };
  }
}
