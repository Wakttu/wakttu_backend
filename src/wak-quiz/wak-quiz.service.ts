import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Room } from 'src/room/entities/room.entity';
import { Game, SocketGateway } from 'src/socket/socket.gateway';
import { SocketService } from 'src/socket/socket.service';

class Answer {
  index: number;
  submit: string;
}

class Rule {
  constructor() {
    this.answer = [];
  }
  answer: Answer[];
}

@Injectable()
export class WakQuizService {
  public rules: {
    [roomId: string]: Rule;
  } = {};
  constructor(
    @Inject(forwardRef(() => SocketGateway))
    private readonly socketGateway: SocketGateway,
    private readonly socketService: SocketService,
  ) {}
  public server;

  async handleStart(roomId: string, roomInfo: Room, game: Game) {
    game.total = game.users.length;
    game.quiz = await this.socketService.getQuizList(roomInfo.round);
    roomInfo.start = (
      await this.socketService.setStart(roomId, roomInfo.start)
    ).start;
    this.rules[roomId] = new Rule();
    this.server.to(roomId).emit('wak-quiz.start', game);
  }
  handleRound(roomId: string, roomInfo: Room, game: Game) {
    const curRound = game.round++;
    const lastRound = roomInfo.round;
    if (curRound === lastRound) {
      this.server.to(roomId).emit('end', { message: 'end' });
      return;
    }
    game.target = game.quiz[curRound];
    this.rules[roomId].answer.splice(0);
    this.server.to(roomId).emit('wak-quiz.round', game);
  }

  handleAnswer(roomId: string, index: number, submit: string) {
    this.rules[roomId].answer.push({ index, submit });
    this.server.to(roomId).emit('wak-quiz.answer', this.rules[roomId]);
  }
}
