import { Test, TestingModule } from '@nestjs/testing';
import { BellService } from './bell.service';

describe('BellService', () => {
  let service: BellService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BellService],
    }).compile();

    service = module.get<BellService>(BellService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
