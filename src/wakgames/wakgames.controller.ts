import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  Session,
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
      let { data, response } = await this.wakgamesService.updateToken(
        session.refreshToken,
      );
      console.log(data, response);
      session.accessToken = data.accessToken;
      session.refreshToken = data.refreshToken;
    }
    return { data, response };
  }

  @Get('achieve')
  async getAchieve(@Session() session: Record<string, any>) {
    const { data, response } = await this.wakgamesService.getAchieve(
      session.accessToken,
    );
    console.log(data, response);
    return { data, response };
  }

  @Post('acheive')
  async postAchieve(@Query() query, @Session() session: Record<string, any>) {
    const { data, response } = await this.wakgamesService.postAchieve(
      query,
      session.accessToken,
    );
    console.log(data, response);
    return { data, response };
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
    console.log(data, response);
    return { data, response };
  }

  @Put('stat')
  async putStat(@Body() body, @Session() session: Record<string, any>) {
    const { data, response } = await this.wakgamesService.putStat(
      body,
      session.accessToken,
    );
    console.log(data, response);
    return { data, response };
  }
}
