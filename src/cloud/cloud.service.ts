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
    const infos = createCloudInfo(roomInfo.round * 20);
    game.cloud = cloud.map((item, idx) => {
      return {
        ...item,
        ...infos[idx],
        clear: false,
        type: setCloudType(idx),
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
    game.users[idx].score += score;
  }
}

const createCloudInfo = (count = 20) => {
  const maxWidth = 71.125; // 82 - 10.875
  const maxHeight = 25.25; // 32.6875 - 7.4375
  const randomInRange = (min, max) => Math.random() * (max - min) + min;

  const clouds = Array.from({ length: count }, (_, i) => {
    const xSegment = i % Math.sqrt(count); // x를 구간별로 분리
    const ySegment = Math.floor(i / Math.sqrt(count)); // y를 구간별로 분리

    const segmentWidth = maxWidth / Math.sqrt(count);
    const segmentHeight = maxHeight / Math.sqrt(count);

    const x = `${randomInRange(xSegment * segmentWidth, (xSegment + 1) * segmentWidth)}rem`;
    const y = `${randomInRange(ySegment * segmentHeight, (ySegment + 1) * segmentHeight)}rem`;
    const duration = `${randomInRange(3, 6)}s`;
    const delay = `${randomInRange(0, 2)}s`;

    return { x, y, duration, delay, clear: false };
  });

  clouds.sort(() => Math.random() - 0.5);
  return clouds;
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

const setCloudType = (idx: number) => {
  const mul = (idx + 1) % 20;
  if (mul <= 2) return 1;
  else if (mul === 3) return 2;
  return 0;
};
