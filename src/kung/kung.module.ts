import { Module, forwardRef } from '@nestjs/common';
import { KungService } from './kung.service';
import { SocketModule } from 'src/socket/socket.module';
@Module({
  imports: [forwardRef(() => SocketModule)],
  providers: [KungService],
  exports: [KungService],
})
export class KungModule {}
