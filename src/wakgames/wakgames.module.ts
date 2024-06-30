import { Module } from '@nestjs/common';
import { WakgamesService } from './wakgames.service';
import { WakgamesController } from './wakgames.controller';

@Module({
  providers: [WakgamesService],
  exports: [WakgamesService],
  controllers: [WakgamesController],
})
export class WakgamesModule {}
