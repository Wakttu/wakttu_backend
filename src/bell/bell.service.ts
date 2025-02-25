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
  ) {}
  public server;
  public answer: {
    [roomId: string]: string[];
  } = {};

  async handleStart(
    roomId: string,
    roomInfo: Room,
    game: Game,
    practice?: boolean,
  ) {
    game.turn = -1;
    game.round = 0;
    game.target = '';
    game.total = game.users.length;
    game.quiz = await this.socketService.getQuiz(roomInfo.round);
    roomInfo.start = true;
    await this.socketService.setStart(roomId, false);

    this.server
      .to(roomId)
      .emit(practice ? 'bell.practice' : 'bell.start', game);
  }

  async handleRound(roomId: string, roomInfo: Room, game: Game) {
    if (!game) return;
    if (game.round === roomInfo.round) {
      game.users.sort((a, b) => b.score - a.score);
      this.server
        .to(roomId)
        .emit('bell.result', { game: game, roomInfo: roomInfo });
      const scores = await this.socketService.setResult(game.users);
      roomInfo = await this.socketService.setStart(roomId, roomInfo.start);

      game.users.forEach((user) => {
        this.socketGateway.user[user.userId].score = scores[user.id];
      });
      game.users.splice(0, game.total);
      game.turn = -1;
      this.server
        .to(roomId)
        .emit('bell.end', { game: game, roomInfo: roomInfo });
      return;
    }
    game.users.forEach((user) => (user.success = undefined));
    game.roundTime = 30000;
    game.target = game.quiz[game.round]._id;

    game.quiz[game.round].choseong = hangulTools().toChoseong(game.target);
    const choseong: string = game.quiz[game.round].choseong;
    const arr = this.getCombinations(game.target.length);

    game.quiz[game.round].hint = arr.map((item: number[]) => {
      const mul = choseong.split('');
      item.map((val: number) => {
        mul[val] = game.target[val];
      });
      return mul.join('');
    });

    game.round += 1;

    this.server.to(roomId).emit('bell.round', game);
  }

  getCombinations(len: number) {
    const requiredIndices = 2 * Math.floor(len / 3);
    if (len < requiredIndices) {
      return [];
    }

    const hint = [];
    const usedIndices = new Set();
    const hintSize = Math.floor(len / 3);

    while (hint.length < 2) {
      const results = [];
      for (let i = 0; i < hintSize; i++) {
        let idx;
        do {
          idx = Math.floor(Math.random() * len);
        } while (usedIndices.has(idx));

        results.push(idx);
        usedIndices.add(idx);
      }
      hint.push(results);
    }

    return hint;
  }

  handleAnswer(idx: number, game: Game, score: number) {
    const team = game.users[idx].team;
    if (team) {
      game.users.forEach((user) => {
        if (user.team === team) {
          user.score += score;
          user.success = true;
        }
      });
    } else {
      game.users[idx].score += score;
      game.users[idx].success = true;
    }
  }
}
