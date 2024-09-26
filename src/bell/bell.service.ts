import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Room } from 'src/room/entities/room.entity';
import { Game, SocketGateway } from 'src/socket/socket.gateway';
import { SocketService } from 'src/socket/socket.service';
import { hangulTools } from './hangul';

@Injectable()
export class BellService {
  constructor(
    @Inject(forwardRef(() => SocketGateway))
    private readonly socketGateway: SocketGateway,
    private readonly socketService: SocketService,
  ) {
    this.tools = hangulTools();
  }
  public server;
  public tools;
  public hint: {
    [roomId: string]: string[];
  } = {};

  async handleStart(roomId: string, roomInfo: Room, game: Game) {
    game.round = 0;
    game.target = '';
    game.total = game.users.length;
    game.roundTime = roomInfo.time;
    game.quiz = await this.socketService.getQuiz(roomInfo.round);
    roomInfo.start = (
      await this.socketService.setStart(roomId, roomInfo.start)
    ).start;
    this.server.to(roomId).emit('bell.start', game);
  }
}
