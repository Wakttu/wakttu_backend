import { Test, TestingModule } from '@nestjs/testing';
import { LastService } from './last.service';

describe('LastService', () => {
  let service: LastService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LastService],
    }).compile();

    service = module.get<LastService>(LastService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
