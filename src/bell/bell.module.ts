import { forwardRef, Module } from '@nestjs/common';
import { BellService } from './bell.service';
import { SocketModule } from 'src/socket/socket.module';

@Module({
  imports: [forwardRef(() => SocketModule)],
  providers: [BellService],
  exports: [BellService],
})
export class BellModule {}
