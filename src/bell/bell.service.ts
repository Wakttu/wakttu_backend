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

  async handleStart(roomId: string, roomInfo: Room, game: Game) {
    game.turn = -1;
    game.round = 0;
    game.target = '';
    game.total = game.users.length;
    game.quiz = await this.socketService.getQuiz(roomInfo.round);
    roomInfo.start = (
      await this.socketService.setStart(roomId, roomInfo.start)
    ).start;
    this.server.to(roomId).emit('bell.start', game);
  }

  async handleRound(roomId: string, roomInfo: Room, game: Game) {
    if (!game) return;
    if (game.round === roomInfo.round) {
      game.users.sort((a, b) => b.score - a.score);
      this.server
        .to(roomId)
        .emit('bell.result', { game: game, roomInfo: roomInfo });
      const scores = await this.socketService.setResult(game.users);
      const result = await this.socketService.setStart(roomId, roomInfo.start);
      roomInfo.start = result.start;
      roomInfo.users = result.users;
      roomInfo = { ...result };
      game.users.forEach((user) => {
        this.socketGateway.user[user.id].score = scores[user.id];
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
    const hint = [];

    for (let i = 0; i < 2; i++) {
      const results = [];
      let count = Math.floor(len / 3);
      while (count) {
        const idx = Math.floor(Math.random() * len);
        if (results.includes(idx)) continue;
        results.push(idx);
        count--;
      }
      hint.push(results);
    }
    return hint; // 결과 담긴 results return
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
