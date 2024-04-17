import { Controller, Get, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { Request } from 'express';
import { SocketService } from './socket/socket.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private socketService: SocketService,
  ) {}

  // 세션로그인 되는지 확인용 코드
  @Get()
  isLoggined(@Req() req: Request): any {
    return req.user;
  }
}
