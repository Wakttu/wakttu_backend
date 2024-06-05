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
    game.total = game.users.length;
    game.keyword = await this.socketService.setWord(roomInfo.round);
    roomInfo.start = (
      await this.socketService.setStart(roomId, roomInfo.start)
    ).start;
    this.rules[roomId] = new Rule(roomInfo.users.length);
    this.server.to(roomId).emit('kung.start', game);
  }
  handleRound(roomId: string, roomInfo: Room, game: Game) {
    const curRound = game.round++;
    const lastRound = roomInfo.round;
    if (curRound === lastRound) {
      this.server.to(roomId).emit('end', { message: 'end' });
      return;
    }
    const target = game.keyword['_id'];
    game.target = target[curRound];
    this.server.to(roomId).emit('kung.round', game);
  }

  handleBan(roomId: string, index: number, keyword: string) {
    this.rules[roomId].ban[index] = keyword;
    this.server.to(roomId).emit('kung.ban', this.rules[roomId]);
  }

  handleShuffle(game: Game) {
    const arr = game.users;
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    game.users = arr;
  }
}
