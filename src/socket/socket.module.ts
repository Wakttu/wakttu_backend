import { Module, forwardRef } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';
import { RoomModule } from 'src/room/room.module';
import { DictionaryModule } from 'src/dictionary/dictionary.module';
import { UserModule } from 'src/user/user.module';
import { KungModule } from 'src/kung/kung.module';
import { LastModule } from 'src/last/last.module';
import { WakQuizModule } from 'src/wak-quiz/wak-quiz.module';
import { QuizModule } from 'src/quiz/quiz.module';

@Module({
  imports: [
    UserModule,
    RoomModule,
    DictionaryModule,
    QuizModule,
    forwardRef(() => WakQuizModule),
    forwardRef(() => LastModule),
    forwardRef(() => KungModule),
  ],
  providers: [SocketGateway, SocketService],
  exports: [SocketGateway, SocketService],
})
export class SocketModule {}
