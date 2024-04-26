import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { SocketGateway } from 'src/socket/socket.gateway';

/*class Rule {
  ban: string[];
}*/
@Injectable()
export class KungService {
  constructor(
    @Inject(forwardRef(() => SocketGateway))
    private readonly socketGateway: SocketGateway,
  ) {}
  public server;

  setRule(roomId: string) {
    this.server.to(roomId).emit('setRule', '금지어를 설정해주세요');
  }
  handleTest() {
    console.log(this.server);
    this.server.emit('kung', 'testing');
  }
}
