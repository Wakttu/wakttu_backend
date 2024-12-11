import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Room } from 'src/room/entities/room.entity';
import { Game, SocketGateway } from 'src/socket/socket.gateway';
import { SocketService } from 'src/socket/socket.service';

@Injectable()
export class CloudService {
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
    game.total = game.users.length;
    const cloud = await this.socketService.getCloud(roomInfo.round);
    game.cloud = cloud.map((item, idx) => {
      return {
        ...item,
        ...createCloudInfo(),
        clear: false,
        type: (idx + 1) % 20 === 0 ? 1 : 0,
      };
    });
    roomInfo.start = true;
    await this.socketService.setStart(roomId, false);

    this.server.to(roomId).emit('cloud.start', game);
  }

  async handleRound(roomId: string, roomInfo: Room, game: Game) {
    if (!game) return;
    if (game.round === roomInfo.round) {
      game.users.sort((a, b) => b.score - a.score);
      this.server
        .to(roomId)
        .emit('cloud.result', { game: game, roomInfo: roomInfo });
      const scores = await this.socketService.setResult(game.users);
      roomInfo = await this.socketService.setStart(roomId, roomInfo.start);

      game.users.forEach((user) => {
        this.socketGateway.user[user.id].score = scores[user.id];
      });
      game.users.splice(0, game.total);
      game.turn = -1;
      this.server
        .to(roomId)
        .emit('cloud.end', { game: game, roomInfo: roomInfo });
      return;
    }
    game.roundTime = 60000;

    game.round += 1;

    this.server.to(roomId).emit('cloud.round', { game, weather: setWeather() });
  }

  handleAnswer(idx: number, game: Game, score: number) {
    const team = game.users[idx].team;
    if (team) {
      game.users.forEach((user) => {
        if (user.team === team) {
          user.score += score;
        }
      });
    } else {
      game.users[idx].score += score;
    }
  }
}

const createCloudInfo = () => {
  const maxWidth = 82 - 10.875;
  const maxHeight = 32.6875 - 7.4375;
  const x = `${Math.random() * maxWidth}rem`;
  const y = `${Math.random() * maxHeight}rem`;
  const duration = `${Math.random() * 3 + 3}s`; // 3초에서 6초 사이의 지속 시간
  const delay = `${Math.random() * 2}s`;
  return { x, y, duration, delay, clear: false };
};

const setWeather = () => {
  const weatherOptions = [
    { type: 'cloud', probability: 0.5 }, // 50% chance
    { type: 'wind', probability: 0.2 }, // 20% chance
    { type: 'fog', probability: 0.2 }, // 20% chance
    { type: 'segu', probability: 0.1 }, // 10% chance
  ];

  const random = Math.random();

  let cumulativeProbability = 0;
  for (const weather of weatherOptions) {
    cumulativeProbability += weather.probability;
    if (random < cumulativeProbability) {
      return weather.type;
    }
  }

  return 'cloud';
};
