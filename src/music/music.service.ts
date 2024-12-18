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
    game.music = [
      {
        videoId: 'eEPmx_JZCkY',
        channelId: 'UC-oCJP9t47v7-DmsnmXV38Q',
        title: '유',
        thumbnail: 'https://i.ytimg.com/vi/eEPmx_JZCkY/hqdefault.jpg',
        answer: ['유', 'U'],
        tag: ['릴파'],
        videoStartSec: 30,
        hint: ['ㅇ', '유'],
      },
      {
        videoId: '_Dxud_w8iFo',
        channelId: 'UC-oCJP9t47v7-DmsnmXV38Q',
        title: '아이돌',
        thumbnail: 'https://i.ytimg.com/vi/_Dxud_w8iFo/hqdefault.jpg',
        answer: ['아이돌'],
        tag: ['비챤'],
        videoStartSec: 30,
        hint: ['ㅇㅇㄷ', '아이돌'],
      },
      {
        videoId: 'c5p1TEC0JqE',
        channelId: 'UChCqDNXQddSr0ncjs_78duA',
        title: '노브레인(NoBrain) - 비와 당신 Covered by 바이터',
        thumbnail: 'https://i.ytimg.com/vi/c5p1TEC0JqE/default.jpg',
        answer: ['비와당신', '비와 당신'],
        tag: ['고멤'],
        videoStartSec: 30,
        hint: ['ㅂㅇㄷㅅ', '비와당신'],
      },
      {
        videoId: '8MImc3MxYZg',
        channelId: 'UCHE7GBQVtdh-c1m3tjFdevQ',
        title: 'DRAMAㅣ징버거 COVER',
        thumbnail: 'https://i.ytimg.com/vi/8MImc3MxYZg/default.jpg',
        answer: ['드라마', 'drama'],
        tag: ['징버거'],
        videoStartSec: 30,
        hint: ['ㄷㄹㅁ', '드라마'],
      },
      {
        videoId: 'Gv_Q-gliHG8',
        channelId: 'UC-oCJP9t47v7-DmsnmXV38Q',
        title: 'Q 윙크 W 볼빵빵 평평 애교',
        thumbnail: 'https://i.ytimg.com/vi/Gv_Q-gliHG8/hqdefault.jpg',
        answer: ['애교'],
        tag: ['릴파'],
        videoStartSec: 0,
        hint: ['ㅇㄱ', '애교'],
      },
      {
        videoId: '_Dxud_w8iFo',
        channelId: 'UC-oCJP9t47v7-DmsnmXV38Q',
        title: '아이돌',
        thumbnail: 'https://i.ytimg.com/vi/_Dxud_w8iFo/hqdefault.jpg',
        answer: ['아이돌'],
        tag: ['비챤'],
        videoStartSec: 30,
        hint: ['ㅇㅇㄷ', '아이돌'],
      },
      {
        videoId: 'eEPmx_JZCkY',
        channelId: 'UC-oCJP9t47v7-DmsnmXV38Q',
        title: '유',
        thumbnail: 'https://i.ytimg.com/vi/eEPmx_JZCkY/hqdefault.jpg',
        answer: ['유', 'U'],
        tag: ['릴파'],
        videoStartSec: 30,
        hint: ['ㅇ', '유'],
      },
    ];
    roomInfo.start = true;
    await this.socketService.setStart(roomId, false);

    game.target = game.music[game.round].answer;
    this.server.to(roomId).emit('music.start', game);
  }

  async handleRound(roomId: string, roomInfo: Room, game: Game) {
    if (!game) return;
    if (game.round === roomInfo.round) {
      console.log('music end');
      console.log(game, roomInfo);
      game.users.sort((a, b) => b.score - a.score);
      this.server.to(roomId).emit('music.end', { game, roomInfo });
      return;
    }
    game.users.forEach((user) => (user.success = undefined));

    game.round++;
    game.target = game.music[game.round].answer;
    this.server.to(roomId).emit('music.round', game);
  }

  handleReady(roomId: string, game: Game, userId: string) {
    if (!game || !roomId) return;
    const idx = game.users.findIndex((user) => user.userId === userId);
    if (idx !== -1) game.users[idx].success = true;
    const count = game.users.filter((user) => user.success).length;
    console.log(count)
    if (count === game.users.length) {
      game.users.forEach((user) => {
        user.success = false;
      });
      this.server.to(roomId).emit('music.play', game);
    }
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


  handleLog(roomId: string, game: Game, userId: string) {
    if (!game || !roomId) return;
    this.server.to(roomId).emit('music.log', game);
  }
}
