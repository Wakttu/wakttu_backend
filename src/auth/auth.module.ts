import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { WakgamesModule } from 'src/wakgames/wakgames.module';
import { StatsModule } from 'src/stats/stats.module';

@Module({
  imports: [
    UserModule,
    PassportModule.register({
      session: true,
    }),
    WakgamesModule,
    StatsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
