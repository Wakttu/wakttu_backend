import { Test, TestingModule } from '@nestjs/testing';
import { WakgamesController } from './wakgames.controller';

describe('WakgamesController', () => {
  let controller: WakgamesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WakgamesController],
    }).compile();

    controller = module.get<WakgamesController>(WakgamesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
