import { Test, TestingModule } from '@nestjs/testing';
import { KungService } from './kung.service';

describe('KungService', () => {
  let service: KungService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KungService],
    }).compile();

    service = module.get<KungService>(KungService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
