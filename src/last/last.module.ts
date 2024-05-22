import { Module, forwardRef } from '@nestjs/common';
import { LastService } from './last.service';
import { SocketModule } from 'src/socket/socket.module';

@Module({
  imports: [forwardRef(() => SocketModule)],
  providers: [LastService],
  exports: [LastService],
})
export class LastModule {}
