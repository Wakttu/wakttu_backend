import { Test, TestingModule } from '@nestjs/testing';
import { WakQuizService } from './wak-quiz.service';

describe('WakQuizService', () => {
  let service: WakQuizService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WakQuizService],
    }).compile();

    service = module.get<WakQuizService>(WakQuizService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
