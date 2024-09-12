import { join } from 'path';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';

import { AppController } from './app.controller';
import { SocketModule } from './socket/socket.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { DictionaryModule } from './dictionary/dictionary.module';
import { RoomModule } from './room/room.module';
import { KungModule } from './kung/kung.module';
import { LastModule } from './last/last.module';
import { QuizModule } from './quiz/quiz.module';
import { WakQuizModule } from './wak-quiz/wak-quiz.module';
import { WakgamesModule } from './wakgames/wakgames.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development', '.env'],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
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
    WakgamesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
