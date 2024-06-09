import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SocketModule } from './socket/socket.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { DictionaryModule } from './dictionary/dictionary.module';
import { RoomModule } from './room/room.module';
import { KungModule } from './kung/kung.module';
import { LastModule } from './last/last.module';
import { QuizModule } from './quiz/quiz.module';
import { ConfigModule } from '@nestjs/config';
import { WakQuizModule } from './wak-quiz/wak-quiz.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
    }),
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    SocketModule,
    PrismaModule,
    UserModule,
    AuthModule,
    DictionaryModule,
    RoomModule,
    KungModule,
    LastModule,
    QuizModule,
    WakQuizModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
