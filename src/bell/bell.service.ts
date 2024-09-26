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
  public question: {
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

  handleQuestion(
    roomId,
    quiz: {
      _id: string;
      meta: { tag: string; [x: string]: any };
      mean: string;
      [x: string]: any;
    },
  ) {
    const { _id, meta, mean } = quiz;
    const choseong = this.tools.toChoseong(_id);
    const question = { id: _id, tag: meta.tag, hint: [mean, choseong] };
    return question;
  }

  async handleRound(roomId: string, roomInfo: Room, game: Game) {
    const curRound = game.round++;
    const lastRound = roomInfo.round;
    if (curRound === lastRound) {
      this.server
        .to(roomId)
        .emit('bell.result', { game: game, roomInfo: roomInfo });
      roomInfo = await this.socketService.setStart(roomId, roomInfo.start);
      game.users.splice(0, game.total);
      this.server
        .to(roomId)
        .emit('bell.end', { game: game, roomInfo: roomInfo });
      return;
    }
    game.roundTime = roomInfo.time;
    game.turnTime = this.socketService.getTurnTime(roomInfo.time);
    this.server.to(roomId).emit('bell.round', game);
  }
}
