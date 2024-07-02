import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  Session,
  UnauthorizedException,
} from '@nestjs/common';
import { WakgamesService } from './wakgames.service';

@Controller('wakta')
export class WakgamesController {
  constructor(private readonly wakgamesService: WakgamesService) {}

  @Get()
  async getProfile(@Session() session: Record<string, any>) {
    const { data, response } = await this.wakgamesService.getProfile(
      session.accessToken,
    );
    if (response.status === 401) {
      const { data, response } = await this.wakgamesService.updateToken(
        session.refreshToken,
      );
      if (response.status !== 200) throw new UnauthorizedException();
      session.accessToken = data.accessToken;
      session.refreshToken = data.refreshToken;
      return await this.getProfile(session);
    }
    return data;
  }

  @Get('achieve')
  async getAchieve(@Session() session: Record<string, any>) {
    const { data, response } = await this.wakgamesService.getAchieve(
      session.accessToken,
    );
    if (response.status === 401) {
      const { data, response } = await this.wakgamesService.updateToken(
        session.refreshToken,
      );
      if (response.status !== 200) throw new UnauthorizedException();
      session.accessToken = data.accessToken;
      session.refreshToken = data.refreshToken;
      return await this.getAchieve(session);
    }
    return data;
  }

  @Post('achieve')
  async postAchieve(@Query() query, @Session() session: Record<string, any>) {
    const { data, response } = await this.wakgamesService.postAchieve(
      query,
      session.accessToken,
    );
    if (response.status === 401) {
      const { data, response } = await this.wakgamesService.updateToken(
        session.refreshToken,
      );
      if (response.status !== 200) throw new UnauthorizedException();
      session.accessToken = data.accessToken;
      session.refreshToken = data.refreshToken;
      return await this.postAchieve(query, session);
    } else if (response.status === 409) {
      return {
        status: response.status,
        message: '이미 달성된 도전과제입니다!',
      };
    } else if (response.status === 404) {
      return {
        status: response.status,
        message: '해당 도전 과제를 찾을 수 없습니다.',
      };
    }
    return data;
  }

  @Get('stat')
  async getStat(
    @Query('id') id: string,
    @Session() session: Record<string, any>,
  ) {
    const { data, response } = await this.wakgamesService.getStat(
      id,
      session.accessToken,
    );
    if (response.status === 401) {
      const { data, response } = await this.wakgamesService.updateToken(
        session.refreshToken,
      );
      if (response.status !== 200) throw new UnauthorizedException();
      session.accessToken = data.accessToken;
      session.refreshToken = data.refreshToken;
      return await this.getStat(id, session);
    }
    return data;
  }

  @Put('stat')
  async putStat(@Body() body, @Session() session: Record<string, any>) {
    const { data, response } = await this.wakgamesService.putStat(
      body,
      session.accessToken,
    );
    if (response.status === 401) {
      const { data, response } = await this.wakgamesService.updateToken(
        session.refreshToken,
      );
      if (response.status !== 200) throw new UnauthorizedException();
      session.accessToken = data.accessToken;
      session.refreshToken = data.refreshToken;
      return await this.putStat(body, session);
    }
    return data;
  }
}
