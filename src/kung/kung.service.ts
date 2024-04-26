import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { SocketGateway } from 'src/socket/socket.gateway';

@Injectable()
export class KungService {
  constructor(
    @Inject(forwardRef(() => SocketGateway))
    private readonly socketGateway: SocketGateway,
  ) {
    this.server = this.socketGateway.server;
  }
  public server;
}
