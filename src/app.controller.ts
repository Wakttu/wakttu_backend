import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { AppService } from './app.service';
import { SocketGateway } from './socket/socket.gateway';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly socketGateway: SocketGateway,
  ) {}

  // 세션로그인 되는지 확인용 코드
  @Get()
  isLoggined(@Req() req: Request): any {
    return req.user;
  }

  @Get('/test')
  getSession(@Req() req: Request): any {
    const user = this.appService.findUser(req.session.user);
    if (!user) req.session.destroy(() => {});
    return req.session;
  }

  @Get('/achieve')
  async getAchieve() {
    return await this.appService.getAchieve();
  }

  @Get('test')
  test() {
    const server = this.socketGateway.server;
    server.emit('test', this.socketGateway.clients);
  }
}
