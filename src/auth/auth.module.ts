import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { NaverStrategy } from './naver-strategy';
import { UserModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { SessionSerializer } from 'src/serializer';

@Module({
  imports: [
    UserModule,
    PassportModule.register({
      session: true,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, NaverStrategy, SessionSerializer],
})
export class AuthModule {}
