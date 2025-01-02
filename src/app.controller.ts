import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // 세션로그인 되는지 확인용 코드
  @Get()
  isLoggined(@Req() req: Request): any {
    return req.user;
  }

  @Get('/test')
  async getSession(@Req() req: Request) {
    const { status, user } = await this.appService.findUser(req.session.user);
    if (!status) req.session.destroy(() => {});
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ..._user } = user;
    if (user) req.session.user = _user;
    return req.session;
  }

  @Get('/achieve')
  async getAchieve() {
    return await this.appService.getAchieve();
  }
}
