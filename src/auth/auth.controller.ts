import {
  Controller,
  UseGuards,
  Get,
  Req,
  Res,
  Post,
  Body,
  Query,
  BadRequestException,
  Session,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { IsNotLoginedGuard } from './isNotLogined-auth.guard';
import { LocalAuthenticatedGuard } from './local-auth.guard';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
import { ConfigService } from '@nestjs/config';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @ApiOperation({ summary: 'logout' })
  @Get('logout')
  async logout(@Req() request: Request): Promise<any> {
    return await this.authService.logout(request);
  }

  @ApiOperation({ summary: 'Local Login' })
  @ApiBody({
    schema: {
      properties: {
        id: { type: 'string' },
        password: { type: 'string' },
      },
    },
  })
  @Post('login')
  @UseGuards(LocalAuthenticatedGuard)
  @UseGuards(IsNotLoginedGuard)
  async localLogin(
    @Body() body: LoginUserDto,
    @Session() session,
  ): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...user } = await this.authService.LocalLogin(body);
    session.user = user;
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
  @UseGuards(IsNotLoginedGuard)
  async signup(@Body() user: CreateUserDto): Promise<any> {
    return await this.authService.signup(user);
  }

  @ApiOperation({ summary: 'check to login User' })
  @Get('status')
  async user(@Session() session) {
    return session;
  }

  @ApiOperation({ summary: 'check duplicate inspection of id' })
  @ApiBody({
    schema: {
      properties: {
        id: { type: 'string' },
      },
    },
  })
  @Post('check/id')
  async checkId(@Body('id') id: string): Promise<any> {
    return await this.authService.checkId(id);
  }

  @ApiOperation({ summary: 'check duplicate inspection of name' })
  @ApiBody({
    schema: {
      properties: {
        name: { type: 'string' },
      },
    },
  })
  @Post('check/name')
  async checkName(@Body('name') name: string): Promise<any> {
    return await this.authService.checkName(name);
  }

  @Get('wakta')
  async waktaOauth(@Session() session: Record<string, any>) {
    const data = await this.authService.waktaOauth();
    session.auth = data;
    return data;
  }

  @Get('wakta/callback')
  async waktaCallback(@Query() query, @Req() req, @Res() res) {
    if (query.code) {
      req.session.auth.code = query.code;
      const data = await this.authService.waktaLogin(req.session.auth);
      const { accessToken, refreshToken, user } = data;

      req.session.accessToken = accessToken;
      req.session.refreshToken = refreshToken;
      req.session.user = user;

      return res.redirect(this.configService.get<string>('REDIRECT_URL'));
    } else throw new BadRequestException();
  }

  @Get('wakta/refresh')
  async waktaRefresh(@Req() req: Request) {
    const { accessToken, refreshToken } =
      await this.authService.waktaUpdateToken(req.session.refreshToken);
    req.session.accessToken = accessToken;
    req.session.refreshToken = refreshToken;
    return { status: 201, accessToken, refreshToken };
  }
}
