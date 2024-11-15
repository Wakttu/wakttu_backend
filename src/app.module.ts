import { MiddlewareConsumer, Module } from '@nestjs/common';
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
import { ConfigModule } from '@nestjs/config';
import { WakgamesModule } from './wakgames/wakgames.module';
import { BellModule } from './bell/bell.module';
import { ItemModule } from './item/item.module';
import { StatsModule } from './stats/stats.module';
import { CloudflareAuthMiddleware } from './cf-auth.middleware';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
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
    WakgamesModule,
    BellModule,
    ItemModule,
    StatsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CloudflareAuthMiddleware) // Cloudflare 인증 미들웨어 적용
      .forRoutes('*'); // 모든 라우트에 적용 (필요시 특정 경로만 설정 가능)
  }
}
