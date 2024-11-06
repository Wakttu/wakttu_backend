import { forwardRef, Module } from '@nestjs/common';
import { MusicService } from './music.service';
import { SocketModule } from 'src/socket/socket.module';

@Module({
  imports: [forwardRef(() => SocketModule)],
  providers: [MusicService],
  exports: [MusicService],
})
export class MusicModule {}
