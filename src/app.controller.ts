import { Controller, Get, Req } from '@nestjs/common';
import { FastifyRequest } from 'fastify';

@Controller()
export class AppController {
  constructor() {}

  @Get()
  rootAccess() {
    return { happy: 'hacking' };
  }

  // 세션로그인 되는지 확인용 코드
  @Get('/test')
  getSession(@Req() req: FastifyRequest): any {
    return req.session;
  }
}
