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
    game.music = await this.socketService.setMusic(roomInfo.round);
    roomInfo.start = true;
    await this.socketService.setStart(roomId, false);

    game.target = game.music[game.round].answer;
    this.server
      .to(roomId)
      .emit(practice ? 'music.practice' : 'music.start', game);
  }

  async handleRound(roomId: string, roomInfo: Room, game: Game) {
    if (!game) return;
    if (game.round === roomInfo.round) {
      game.users.sort((a, b) => b.score - a.score);
      this.server
        .to(roomId)
        .emit('music.result', { game: game, roomInfo: roomInfo });
      const scores = await this.socketService.setResult(game.users);
      roomInfo = await this.socketService.setStart(roomId, roomInfo.start);
      game.users.forEach((user) => {
        this.socketGateway.user[user.userId].score = scores[user.id];
      });
      game.users.splice(0, game.total);
      this.server.to(roomId).emit('music.end', { game, roomInfo });
      return;
    }

    this.server.to(roomId).emit('chat', {
      user: { name: '시스템', color: '#A377FF' },
      chat: '라운드 준비 중입니다!',
    });

    game.users.forEach((user) => (user.success = undefined));
    game.target = game.music[game.round].answer;
    game.round++;
    this.server.to(roomId).emit('music.round', game);
  }

  handleReady(roomId: string, game: Game, userId: string) {
    if (!game || !roomId) return;
    const idx = game.users.findIndex((user) => user.userId === userId);
    if (idx !== -1) game.users[idx].success = true;
    const count = game.users.filter((user) => user.success).length;
    if (count === game.users.length) {
      game.users.forEach((user) => {
        user.success = false;
      });
      this.server.to(roomId).emit('music.play', game);
    }
  }

  handleStrongPlay(roomId: string, game: Game) {
    if (!game || !roomId) return;
    game.users.forEach((user) => {
      user.success = false;
    });
    this.server.to(roomId).emit('music.play', game);
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

  handleLog(roomId: string, game: Game) {
    if (!game || !roomId) return;
    this.server.to(roomId).emit('music.log', game);
  }
}
