import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Room } from 'src/room/entities/room.entity';
import { Game, SocketGateway } from 'src/socket/socket.gateway';
import { SocketService } from 'src/socket/socket.service';

@Injectable()
export class MusicService {
  public server;

  constructor(
    @Inject(forwardRef(() => SocketGateway))
    private readonly socketGateway: SocketGateway,
    private readonly socketService: SocketService,
  ) {
    this.server = this.socketGateway.server;
  }

  async handleStart(roomId: string, roomInfo: Room, game: Game) {
    game.turn = -1;
    game.round = 0;
    game.target = '';
    game.total = game.users.length;
    game.quiz = await this.socketService.getQuiz(roomInfo.round);
    /* roomInfo.start = (
      await this.socketService.setStart(roomId, roomInfo.start)
    ).start;*/
    this.server.to(roomId).emit('music.start', game);
  }
}
