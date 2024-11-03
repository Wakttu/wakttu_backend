import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Room } from 'src/room/entities/room.entity';
import { Game, SocketGateway } from 'src/socket/socket.gateway';
import { SocketService } from 'src/socket/socket.service';

class Rule {
  constructor(count: number = 8) {
    this.ban = new Array(count).fill('');
  }
  ban: string[];
}

@Injectable()
export class KungService {
  constructor(
    @Inject(forwardRef(() => SocketGateway))
    private readonly socketGateway: SocketGateway,
    private readonly socketService: SocketService,
  ) {}
  public server;
  public rules: {
    [roomId: string]: Rule;
  } = {};

  async handleStart(roomId: string, roomInfo: Room, game: Game) {
    game.turn = 0;
    game.round = 0;
    game.target = '';
    game.total = game.users.length;
    game.roundTime = roomInfo.time;
    roomInfo.start = (
      await this.socketService.setStart(roomId, roomInfo.start)
    ).start;
    game.keyword = await this.socketService.setWord(roomInfo.round);
    if (roomInfo.option.includes('팀전'))
      this.socketService.teamShuffle(game, game.team);
    this.rules[roomId] = new Rule(roomInfo.users.length);
    this.server.to(roomId).emit('kung.start', game);
  }

  async handleRound(roomId: string, roomInfo: Room, game: Game) {
    if (!game) return;
    const curRound = game.round++;
    const lastRound = roomInfo.round;
    if (curRound === lastRound) {
      game.users.sort((a, b) => b.score - a.score);
      this.server
        .to(roomId)
        .emit('kung.result', { game: game, roomInfo: roomInfo });
      const scores = await this.socketService.setResult(game.users);
      roomInfo = await this.socketService.setStart(roomId, roomInfo.start);
      game.users.forEach((user) => {
        this.socketGateway.user[user.id].score = scores[user.id];
      });
      game.users.splice(0, game.total);
      this.server
        .to(roomId)
        .emit('kung.end', { game: game, roomInfo: roomInfo });
      return;
    }
    const target = game.keyword['_id'];
    game.target = target[curRound];
    game.chain = 1;
    game.roundTime = roomInfo.time;
    game.turnTime = this.socketService.getTurnTime(roomInfo.time);
    this.server.to(roomId).emit('kung.round', game);
  }

  handleNextTurn(game: Game, keyword: string, score: number) {
    const team = game.users[game.turn].team;
    if (team) {
      game.users.forEach((user) => {
        if (user.team === team) user.score += score;
      });
    } else game.users[game.turn].score += score;
    game.turn += 1;
    game.turn %= game.total;
    game.chain += 1;
    game.target = keyword[keyword.length - 1];
  }

  handleTurnEnd(game: Game) {
    const chain = game.chain;
    const score = game.users[game.turn].score;
    const after =
      -1 * Math.round(Math.min(10 + chain * 1.5 + score * 0.15, score));

    const team = game.users[game.turn].team;

    if (team) {
      game.users.forEach((user) => {
        if (user.team === team) user.score = score + after;
      });
    } else game.users[game.turn].score = score + after;
  }

  handleCheck(word: string, target: string, length: number) {
    if (length !== 3) return { success: false, message: '길이가 3이 아님' };
    if (word !== target) {
      return { success: false, message: '시작단어가 일치하지 않음' };
    }
    return { success: true, message: '통과' };
  }
}
