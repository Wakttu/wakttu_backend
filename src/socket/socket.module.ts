import { Module, forwardRef } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';
import { RoomModule } from 'src/room/room.module';
import { DictionaryModule } from 'src/dictionary/dictionary.module';
import { UserModule } from 'src/user/user.module';
import { KungModule } from 'src/kung/kung.module';
import { LastModule } from 'src/last/last.module';
import { BellModule } from 'src/bell/bell.module';
import { MusicModule } from 'src/music/music.module';
import { CloudModule } from 'src/cloud/cloud.module';
import { SocketAuthenticatedGuard } from './socket-auth.guard';

@Module({
  imports: [
    UserModule,
    RoomModule,
    DictionaryModule,
    forwardRef(() => LastModule),
    forwardRef(() => KungModule),
    forwardRef(() => BellModule),
    forwardRef(() => MusicModule),
    forwardRef(() => CloudModule),
  ],
  providers: [SocketGateway, SocketService, SocketAuthenticatedGuard],
  exports: [SocketGateway, SocketService],
})
export class SocketModule {}
