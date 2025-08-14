import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { XRay } from './schemas/xray.schema';
import { EventsGateway } from '../websocket/events.gateway';
import { SignalsService } from './signals.service';

describe('SignalsService', () => {
  let service: SignalsService;
  let mockXRayModel: any;
  let mockEventsGateway: any;

  const mockXRay = {
    deviceId: 'test-device-123',
    time: 1735683480000,
    data: [
      {
        time: 762,
        coordinates: [51.339764, 12.339223833333334, 1.2038000000000002],
      },
      {
        time: 1766,
        coordinates: [51.33977733333333, 12.339211833333334, 1.531604],
      },
    ],
    dataLength: 2,
    dataVolume: 123,
    _id: 'mock-id-123',
    save: jest.fn(),
    toJSON: jest.fn(),
  };

  beforeEach(async () => {
    mockEventsGateway = {
      emitProcessStep: jest.fn(),
      server: {} as any,
    };
    
    // Mock Mongoose model with constructor pattern
    function MockModel(data: any) {
      return {
        ...data,
        save: jest.fn().mockResolvedValue({ ...data, _id: 'mock-id-123' }),
      };
    }
    
    // Add static methods to the model
    MockModel.find = jest.fn().mockReturnValue({
      skip: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([mockXRay])
        })
      })
    });
    
    MockModel.findById = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockXRay)
    });
    
    MockModel.findByIdAndUpdate = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockXRay)
    });
    
    MockModel.findByIdAndDelete = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(true)
    });
    
    MockModel.countDocuments = jest.fn().mockResolvedValue(1);
    
    mockXRayModel = MockModel;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignalsService,
        {
          provide: getModelToken(XRay.name),
          useValue: mockXRayModel,
        },
        {
          provide: EventsGateway,
          useValue: mockEventsGateway,
        },
      ],
    }).compile();

    service = module.get<SignalsService>(SignalsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all signals', async () => {
      const paginationDto = { page: 1, limit: 10, skip: 0 };
      const result = {
        items: [mockXRay],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false
      };
      
      const response = await service.findAll(paginationDto);
      expect(response).toEqual(result);
      expect(mockXRayModel.find).toHaveBeenCalled();
    });
  });

  describe('findByDeviceId', () => {
    it('should return signals for a specific device', async () => {
      const deviceId = 'test-device-123';
      const paginationDto = { page: 1, limit: 10, skip: 0 };
      const result = {
        items: [mockXRay],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false
      };
      
      const response = await service.findByDeviceId(deviceId, paginationDto);
      expect(response).toEqual(result);
      expect(mockXRayModel.find).toHaveBeenCalledWith({ deviceId });
    });
  });

  describe('findOne', () => {
    it('should return a signal by id', async () => {
      const id = 'mock-id-123';
      const response = await service.findOne(id);
      expect(response).toEqual(mockXRay);
      expect(mockXRayModel.findById).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if signal not found', async () => {
      const id = 'nonexistent-id';
      jest.spyOn(mockXRayModel, 'findById').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });
      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
      expect(mockXRayModel.findById).toHaveBeenCalledWith(id);
    });
  });

  describe('processXRayData', () => {
    it('should process and save x-ray data', async () => {
      const message = {
        content: Buffer.from(
          JSON.stringify({
            'test-device-123': {
              time: 1735683480000,
              data: [
                [762, [51.339764, 12.339223833333334, 1.2038000000000002]],
                [1766, [51.33977733333333, 12.339211833333334, 1.531604]],
              ],
            },
          }),
        ),
      };

      await service.processXRayData(message as any);
      
      // Verify that the event was emitted
      expect(mockEventsGateway.emitProcessStep).toHaveBeenCalled();
    });
  });
});
