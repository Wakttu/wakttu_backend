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

  async handleStart(roomId: string, roomInfo: Room, game: Game) {
    game.turn = -1;
    game.round = 0;
    game.target = '';
    game.total = game.users.length;
    //game.quiz = await this.socketService.getQuiz(roomInfo.round);
    game.music = [
      {
        videoId: 'c5p1TEC0JqE',
        channelId: 'UChCqDNXQddSr0ncjs_78duA',
        title: '노브레인(NoBrain) - 비와 당신 Covered by 바이터',
        thumbnail: 'https://i.ytimg.com/vi/c5p1TEC0JqE/default.jpg',
        answer: ['비와당신', '비와 당신'],
      },
      {
        videoId: '8MImc3MxYZg',
        channelId: 'UCHE7GBQVtdh-c1m3tjFdevQ',
        title: 'DRAMAㅣ징버거 COVER',
        thumbnail: 'https://i.ytimg.com/vi/8MImc3MxYZg/default.jpg',
        answer: ['드라마', 'drama'],
      },
    ];
    roomInfo.start = (
      await this.socketService.setStart(roomId, roomInfo.start)
    ).start;
    this.server.to(roomId).emit('music.start', game);
  }

  handleRound(roomId: string, roomInfo: Room, game: Game) {
    if (!game) return;
    if (game.round === roomInfo.round) {
      this.server.to(roomId).emit('music.end', game);
      return;
    }
    game.target = game.music[game.round++].answer;
    this.server.to(roomId).emit('music.round', game);
  }
}
