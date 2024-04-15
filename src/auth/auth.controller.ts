import {
  Controller,
  UseGuards,
  Get,
  Req,
  Res,
  Post,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { NaverAuthGuard } from './naver-auth.guard';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LocalGuard } from './local-auth.guard';
import { Request, Response } from 'express';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

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
    await this.authService.OAuthLogin(user);
    return res.redirect('/list.html');
  }

  @ApiOperation({ summary: 'logout' })
  @Get('logout')
  logout(@Req() request: Request): Promise<any> {
    return this.authService.logout(request);
  }

  @ApiOperation({ summary: 'Local Login' })
  @ApiBody({
    schema: {
      properties: {
        email: { type: 'string' },
        password: { type: 'string' },
      },
    },
  })
  @Post('local')
  @UseGuards(LocalGuard)
  async login(@Res() res: Response): Promise<any> {
    res.redirect('/list.html');
  }

  @ApiOperation({ summary: 'Local Login' })
  @ApiBody({
    schema: {
      properties: {
        email: { type: 'string' },
        password: { type: 'string' },
      },
    },
  })
  @Post('login')
  @UseGuards(LocalGuard)
  async localLogin(@Req() req: Request): Promise<any> {
    const json = JSON.parse(JSON.stringify(req.user));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...user } = json;
    return user;
  }

  @ApiOperation({ summary: 'Local Signup' })
  @ApiBody({
    schema: {
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        password: { type: 'string' },
      },
    },
  })
  @Post('signup')
  async signup(@Body() user: CreateUserDto): Promise<any> {
    return await this.authService.signup(user);
  }

  @ApiOperation({ summary: 'check to login User' })
  @Get('status')
  async user(@Req() req: any) {
    if (req.user) {
      return {
        data: req.user,
        msg: 'Authenticated',
      };
    } else {
      return {
        msg: 'Not Authenticated',
      };
    }
  }
}
