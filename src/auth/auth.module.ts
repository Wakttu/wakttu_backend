import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { WakgamesModule } from 'src/wakgames/wakgames.module';

@Module({
  imports: [UserModule, WakgamesModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
