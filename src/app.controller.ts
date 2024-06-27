import { Controller, Get, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { Request } from 'express';

import { WakgamesService } from './wakgames/wakgames.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly wakgamesService: WakgamesService,
  ) {}

  // 세션로그인 되는지 확인용 코드
  @Get()
  isLoggined(@Req() req: Request): any {
    return req.user;
  }

  @Get('/test')
  getSession(@Req() req: Request): any {
    return req.session;
  }

  @Get('sdk')
  getSDK() {
    console.log('sdk');
    return this.wakgamesService.getSDK();
  }

  @Get('sdk/oauth')
  getOauth() {
    return this.wakgamesService.handleOauth();
  }
}
