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
@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
    }),
    SocketModule,
    PrismaModule,
    UserModule,
    AuthModule,
    DictionaryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
