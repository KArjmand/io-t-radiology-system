import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RabbitMQService } from './rabbitmq.service';
import { SignalsService } from '../signals/signals.service';

describe('RabbitMQService', () => {
  let service: RabbitMQService;
  let mockSignalsService: Partial<SignalsService>;
  let mockConfigService: Partial<ConfigService>;

  beforeEach(async () => {
    // Create mocks for dependencies
    mockSignalsService = {
      processXRayData: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn(
        () => 'xray_queue',
      ) as unknown as typeof ConfigService.prototype.get,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RabbitMQService,
        { provide: SignalsService, useValue: mockSignalsService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<RabbitMQService>(RabbitMQService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
