import { Controller, UseGuards, Get, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { NaverAuthGuard } from './naver-auth.guard';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Oauth Naver Login' })
  @Get('naver')
  @UseGuards(NaverAuthGuard)
  async naverLogin(): Promise<void> {}

  @ApiOperation({ summary: 'Oauth Naver login Callback' })
  @Get('naver/callback')
  @UseGuards(NaverAuthGuard)
  async naverLoginCallback(@Req() req, @Res() res): Promise<void> {
    const user = req.user;
    const response = await this.authService.OAuthLogin(user);
    return res.json(response);
  }

  @ApiOperation({ summary: 'check to login User' })
  @Get('status')
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
