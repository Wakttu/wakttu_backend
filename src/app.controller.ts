import { Controller, Get, Post, Redirect, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { Request } from 'express';
import { RoomService } from './room/room.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly roomService: RoomService,
  ) {}

  // 세션로그인 되는지 확인용 코드
  @Get()
  isLoggined(@Req() req: Request): any {
    return req.isAuthenticated();
  }

  @Post('/roomTest')
  @Redirect('/list.html')
  createRoom(@Req() req: Request): any {
    console.log(req.body);
  }
}
