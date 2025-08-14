import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EventsGateway } from '../websocket/events.gateway';
import { SignalsService } from './signals.service';
import { XRayRepository } from './xray.repository';

describe('SignalsService', () => {
  let service: SignalsService;
  let mockXRayRepository: Partial<XRayRepository>;
  let mockEventsGateway: Partial<EventsGateway>;

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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      server: {
        emit: jest.fn(),
      } as any,
    };

    // Mock XRayRepository
    mockXRayRepository = {
      create: jest.fn().mockResolvedValue(mockXRay),
      find: jest.fn().mockResolvedValue({
        items: [mockXRay],
        total: 1,
      }),
      findOne: jest.fn().mockResolvedValue(mockXRay),
      update: jest.fn().mockResolvedValue(mockXRay),
      remove: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignalsService,
        {
          provide: XRayRepository,
          useValue: mockXRayRepository,
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
      const filterDto = { page: 1, limit: 10, skip: 0 };
      const result = {
        items: [mockXRay],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };

      (mockXRayRepository.find as jest.Mock).mockResolvedValueOnce({
        items: [mockXRay],
        total: 1,
      });

      const response = await service.findAll(filterDto);
      expect(response).toEqual(result);
      expect(mockXRayRepository.find).toHaveBeenCalledWith(filterDto);
    });
  });

  describe('findAndPaginate', () => {
    it('should return filtered signals', async () => {
      const filterDto = {
        page: 1,
        limit: 10,
        skip: 0,
        deviceId: 'test-device-123',
      };
      const result = {
        items: [mockXRay],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };

      (mockXRayRepository.find as jest.Mock).mockResolvedValueOnce({
        items: [mockXRay],
        total: 1,
      });

      const response = await service.findAndPaginate(filterDto);
      expect(response).toEqual(result);
      expect(mockXRayRepository.find).toHaveBeenCalledWith(filterDto);
    });
  });

  describe('findOne', () => {
    it('should return a signal by id', async () => {
      const id = 'mock-id-123';
      const response = await service.findOne(id);
      expect(response).toEqual(mockXRay);
      expect(mockXRayRepository.findOne).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if signal not found', async () => {
      const id = 'nonexistent-id';
      (mockXRayRepository.findOne as jest.Mock).mockResolvedValueOnce(null);
      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
      expect(mockXRayRepository.findOne).toHaveBeenCalledWith(id);
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

      await service.processXRayData(message);

      // Verify that repository create was called and event was emitted
      expect(mockXRayRepository.create).toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockEventsGateway.emitProcessStep).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a signal', async () => {
      const id = 'mock-id-123';
      const updateData = { id: 'mock-id-123', deviceId: 'updated-device' };

      const response = await service.update(id, updateData);
      expect(response).toEqual(mockXRay);
      expect(mockXRayRepository.update).toHaveBeenCalledWith(
        id,
        expect.any(Object),
      );
    });

    it('should throw NotFoundException if signal not found during update', async () => {
      const id = 'nonexistent-id';
      const updateData = { id: 'nonexistent-id', deviceId: 'updated-device' };

      (mockXRayRepository.update as jest.Mock).mockResolvedValueOnce(null);
      await expect(service.update(id, updateData)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a signal', async () => {
      const id = 'mock-id-123';

      const response = await service.remove(id);
      expect(response).toEqual({ deleted: true });
      expect(mockXRayRepository.remove).toHaveBeenCalledWith(id);
    });
  });
});
