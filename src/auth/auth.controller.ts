import { Controller, UseGuards, Get, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { NaverAuthGuard } from './naver-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('naver')
  @UseGuards(NaverAuthGuard)
  async naverLogin(): Promise<void> {}

  @Get('naver/callback')
  @UseGuards(NaverAuthGuard)
  async naverLoginCallback(@Req() req, @Res() res): Promise<void> {
    const user = req.user;
    const response = await this.authService.OAuthLogin(user);
    console.log(response);
    return res.json(response);
  }
  @Get('/status')
  async user(@Req() req: any) {
    if (req.user) {
      console.log(req.user, 'Authenticated User');
      return {
        msg: 'Authenticated',
      };
    } else {
      console.log(req.user, 'User cannot found');
      return {
        msg: 'Not Authenticated',
      };
    }
  }
}
