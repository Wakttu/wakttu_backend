import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Put,
  Session,
  UseGuards,
} from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsGuard } from './stats.guard';

@Controller('stats')
@UseGuards(StatsGuard)
export class StatsController {
  constructor(private readonly stats: StatsService) {}

  @Get('achieve')
  async getAchieve(@Session() session: Record<string, any>) {
    return await this.stats.getAchieve(session.user.id);
  }

  @Post('achieve')
  async createAchieve(@Body('id') id, @Session() session: Record<string, any>) {
    if (!id) throw new BadRequestException();
    return await this.stats.createAchieve(id, session.user.id);
  }

  @Put()
  async putStat(@Body() body, @Session() session: Record<string, any>) {
    const { statId, val } = body;
    if (!statId || !val) throw new BadRequestException();
    return await this.stats.putStat(session.user.id, body.statId, body.val);
  }

  @Put('result')
  async putResult(@Body() body, @Session() session: Record<string, any>) {
    return await this.stats.putResult(body, session.user);
  }
}
