import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Room } from 'src/room/entities/room.entity';
import { Game, SocketGateway } from 'src/socket/socket.gateway';
import { SocketService } from 'src/socket/socket.service';

@Injectable()
export class LastService {
  constructor(
    @Inject(forwardRef(() => SocketGateway))
    private socketGateway: SocketGateway,
    private readonly socketService: SocketService,
  ) {}
  public server;

  async handleStart(roomId: string, roomInfo: Room, game: Game) {
    game.turn = 0;
    game.round = 0;
    game.target = '';
    game.total = game.users.length;
    game.roundTime = roomInfo.time;
    game.keyword = await this.socketService.setWord(roomInfo.round);
    roomInfo.start = true;
    await this.socketService.setStart(roomId, false);
    this.server.to(roomId).emit('last.start', game);
  }

  async handleRound(roomId: string, roomInfo: Room, game: Game) {
    if (!game) return;
    const curRound = game.round++;
    const lastRound = roomInfo.round;
    if (curRound === lastRound) {
      game.users.sort((a, b) => b.score - a.score);
      this.server
        .to(roomId)
        .emit('last.result', { game: game, roomInfo: roomInfo });
      const scores = await this.socketService.setResult(game.users);
      roomInfo = await this.socketService.setStart(roomId, roomInfo.start);
      game.users.forEach((user) => {
        this.socketGateway.user[user.id].score = scores[user.id];
      });
      game.users.splice(0, game.total);
      game.turn = -1;
      this.server
        .to(roomId)
        .emit('last.end', { game: game, roomInfo: roomInfo });
      return;
    }
    const target = game.keyword['_id'];
    game.target = target[curRound];
    game.mission = await this.handleGetMission();
    game.chain = 1;
    game.total = game.users.length;
    game.roundTime = roomInfo.time;
    game.turnTime = this.socketService.getTurnTime(roomInfo.time);
    game.loading = false;
    this.server.to(roomId).emit('last.round', game);
  }

  async handleCheckMission(chat: string, game: Game) {
    if (chat.includes(game.mission)) {
      game.mission = await this.socketService.getMission();
      return true;
    }
    return false;
  }

  async handleGetMission() {
    return await this.socketService.getMission();
  }

  handleNextTurn(game: Game, keyword: string, score: number) {
    const team = game.users[game.turn].team;
    if (team) {
      game.users.forEach((user) => {
        if (user.team === team) {
          user.score += score;
        }
      });
    } else game.users[game.turn].score += score;
    game.turn += 1;
    game.turn %= game.total;
    game.chain += 1;
    game.target = keyword[keyword.length - 1];
    game.loading = false;
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

  handleCheck(word: string, target: string) {
    if (word !== target) {
      return { success: false, message: '시작단어가 일치하지않음' };
    }
    return { success: true, message: '성공' };
  }
}
