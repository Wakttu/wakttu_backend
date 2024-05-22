import { Module, forwardRef } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';
import { RoomModule } from 'src/room/room.module';
import { DictionaryModule } from 'src/dictionary/dictionary.module';
import { UserModule } from 'src/user/user.module';
import { KungModule } from 'src/kung/kung.module';
import { LastModule } from 'src/last/last.module';

@Module({
  imports: [
    UserModule,
    RoomModule,
    DictionaryModule,
    forwardRef(() => LastModule),
    forwardRef(() => KungModule),
  ],
  providers: [SocketGateway, SocketService],
  exports: [SocketGateway, SocketService],
})
export class SocketModule {}
