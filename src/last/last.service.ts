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
    roomInfo.start = (
      await this.socketService.setStart(roomId, roomInfo.start)
    ).start;
    this.server.to(roomId).emit('last.start', game);
  }

  async handleRound(roomId: string, roomInfo: Room, game: Game) {
    if (!game) return;
    const curRound = game.round++;
    const lastRound = roomInfo.round;
    if (curRound === lastRound) {
      this.server
        .to(roomId)
        .emit('last.result', { game: game, roomInfo: roomInfo });
      const result = await this.socketService.setStart(roomId, roomInfo.start);
      roomInfo.start = result.start;
      roomInfo.users = result.users;
      roomInfo = { ...result };
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
    this.server.to(roomId).emit('last.round', game);
  }

  async handleCheckMission(chat: string, game: Game) {
    if (chat.includes(game.mission)) {
      game.mission = await this.socketService.getMission();
    }
    return;
  }

  async handleGetMission() {
    return await this.socketService.getMission();
  }

  handleNextTurn(game: Game, keyword: string, score: number) {
    game.users[game.turn].score += score;
    game.turn += 1;
    game.turn %= game.total;
    game.chain += 1;
    game.target = keyword[keyword.length - 1];
  }

  handleCheck(word: string, target: string) {
    if (word !== target) {
      return { success: false, message: '시작단어가 일치하지않음' };
    }
    return { success: true, message: '성공' };
  }
}
