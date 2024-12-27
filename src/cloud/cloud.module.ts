import { forwardRef, Module } from '@nestjs/common';
import { CloudService } from './cloud.service';
import { SocketModule } from 'src/socket/socket.module';

@Module({
  imports: [forwardRef(() => SocketModule)],
  providers: [CloudService],
  exports: [CloudService],
})
export class CloudModule {}
