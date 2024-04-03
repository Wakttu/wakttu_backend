import { Module } from '@nestjs/common';
import { DictionaryService } from './dictionary.service';
import { DictionaryController } from './dictionary.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SocketModule } from 'src/socket/socket.module';

@Module({
  imports: [PrismaModule, SocketModule],
  controllers: [DictionaryController],
  providers: [DictionaryService],
})
export class DictionaryModule {}
