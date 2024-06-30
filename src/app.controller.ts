import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller()
export class AppController {
  constructor() {}

  // 세션로그인 되는지 확인용 코드
  @Get()
  isLoggined(@Req() req: Request): any {
    return req.user;
  }

  @Get('/test')
  getSession(@Req() req: Request): any {
    return req.session;
  }
}
