import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SocketModule } from './socket/socket.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [SocketModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
