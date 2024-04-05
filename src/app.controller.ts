import { Controller, Get, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { SocketGateway } from './socket/socket.gateway';
import { Request } from 'express';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly socketGateway: SocketGateway,
  ) {}

  // 세션로그인 되는지 확인용 코드
  @Get()
  isLoggined(@Req() req: Request): any {
    return req.isAuthenticated();
  }

  // socekt 의존성확인 코드
  @Get('test')
  test(@Req() req: any) {
    const server = this.socketGateway.server;
    this.socketGateway.handleTest(req, server);
  }
}
