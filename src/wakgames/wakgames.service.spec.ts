import { Test, TestingModule } from '@nestjs/testing';
import { WakgamesService } from './wakgames.service';

describe('WakgamesService', () => {
  let service: WakgamesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WakgamesService],
    }).compile();

    service = module.get<WakgamesService>(WakgamesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
