import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { SocketGateway } from './socket/socket.gateway';
import { NaverAuthGuard } from './auth/naver-auth.guard';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly socketGateway: SocketGateway,
  ) {}

  @Get()
  @UseGuards(NaverAuthGuard)
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test')
  test() {
    const server = this.socketGateway.server;
    server.emit('test', this.socketGateway.clients);
  }
}
