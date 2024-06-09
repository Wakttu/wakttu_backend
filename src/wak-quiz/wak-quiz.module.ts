import { Module, forwardRef } from '@nestjs/common';
import { WakQuizService } from './wak-quiz.service';
import { SocketModule } from 'src/socket/socket.module';

@Module({
  imports: [forwardRef(() => SocketModule)],
  providers: [WakQuizService],
  exports: [WakQuizService],
})
export class WakQuizModule {}
