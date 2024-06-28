import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { NaverStrategy } from './naver-strategy';
import { UserModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { SessionSerializer } from 'src/serializer';
import { LocalStrategy } from './local-strategy';
import { WakgamesModule } from 'src/wakgames/wakgames.module';

@Module({
  imports: [
    UserModule,
    PassportModule.register({
      session: true,
    }),
    WakgamesModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, NaverStrategy, LocalStrategy, SessionSerializer],
})
export class AuthModule {}
