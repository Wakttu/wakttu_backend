import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { SocketGateway } from 'src/socket/socket.gateway';
import { SocketService } from 'src/socket/socket.service';

@Injectable()
export class WakQuizService {
  constructor(
    @Inject(forwardRef(() => SocketGateway))
    private readonly socketGateway: SocketGateway,
    private readonly socketService: SocketService,
  ) {}
  public server;
}
