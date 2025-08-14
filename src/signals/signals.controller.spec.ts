import { Test, TestingModule } from '@nestjs/testing';
import { SignalsController } from './signals.controller';
import { SignalsService } from './signals.service';

describe('SignalsController', () => {
  let controller: SignalsController;
  let mockSignalsService: Partial<SignalsService>;

  beforeEach(async () => {
    mockSignalsService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findAndPaginate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SignalsController],
      providers: [
        {
          provide: SignalsService,
          useValue: mockSignalsService,
        },
      ],
    }).compile();

    controller = module.get<SignalsController>(SignalsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
