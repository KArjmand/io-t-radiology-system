import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { createPaginatedResponse } from '../common/utils/pagination.utils';
import { RabbitMQMessage, XRayMessage } from '../types';
import { EventsGateway } from '../websocket/events.gateway';
import { CreateSignalDto } from './dto/create-signal.dto';
import { FilterSignalDto } from './dto/filter-signal.dto';
import { UpdateSignalDto } from './dto/update-signal.dto';
import { XRay } from './schemas/xray.schema';
import { XRayRepository } from './xray.repository';

@Injectable()
export class SignalsService {
  private readonly logger = new Logger(SignalsService.name);

  constructor(
    private xrayRepository: XRayRepository,
    private eventsGateway: EventsGateway,
  ) {}

  /**
   * Maps DTO coordinates format to schema tuple format
   */
  private mapDtoToSchema(
    dto: CreateSignalDto | UpdateSignalDto,
  ): Partial<XRay> {
    return {
      ...dto,
      data: dto.data?.map((point) => ({
        ...point,
        coordinates: point.coordinates.toTuple(),
      })),
    };
  }

  async processXRayData(message: RabbitMQMessage): Promise<void> {
    try {
      const parsedData: XRayMessage = JSON.parse(
        message.content.toString(),
      ) as unknown as XRayMessage;

      const deviceId = Object.keys(parsedData)[0];

      // Emit 'MessageReceived' event
      this.eventsGateway.emitProcessStep(deviceId, 'MessageReceived', {
        messageSize: message.content.length,
      });

      const { time, data: rawXrayData } = parsedData[deviceId];

      // Emit 'Processing' event
      this.eventsGateway.emitProcessStep(deviceId, 'Processing', {
        dataPoints: rawXrayData.length,
      });

      const dataLength = rawXrayData.length;
      const dataVolume = JSON.stringify(rawXrayData).length;

      const xrayData = {
        deviceId,
        time,
        data: rawXrayData.map(([time, [x, y, speed]]) => ({
          time,
          coordinates: [x, y, speed] as [number, number, number],
        })),
        dataLength,
        dataVolume,
      };

      const xrayDocument = await this.xrayRepository.create(xrayData);

      // Emit 'Saved' event
      this.eventsGateway.emitProcessStep(deviceId, 'Saved', {
        documentId: xrayDocument._id,
        dataLength,
        dataVolume,
      });

      this.logger.log(`Processed and saved x-ray data for device ${deviceId}`);
    } catch (error: unknown) {
      this.logger.error('Error processing x-ray data', error);

      // Emit 'Error' event if there's an error
      if (
        error &&
        typeof error === 'object' &&
        'deviceId' in error &&
        'message' in error
      ) {
        this.eventsGateway.emitProcessStep(String(error.deviceId), 'Error', {
          message: String(error.message),
        });
      }

      throw error;
    }
  }

  async findAll(
    paginationDto: FilterSignalDto,
  ): Promise<PaginatedResponseDto<XRay>> {
    try {
      const { items, total } = await this.xrayRepository.find(paginationDto);
      return createPaginatedResponse(items, total, paginationDto);
    } catch (error) {
      this.logger.error('Error finding signals with pagination', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<XRay> {
    try {
      const signal = await this.xrayRepository.findOne(id);

      if (!signal)
        throw new NotFoundException(`Signal with ID ${id} not found`);

      return signal;
    } catch (error) {
      this.logger.error(`Error finding signal with ID ${id}`, error);
      throw error;
    }
  }

  async create(createSignalDto: CreateSignalDto): Promise<XRay> {
    try {
      const mappedData = this.mapDtoToSchema(createSignalDto);
      const createdSignal = await this.xrayRepository.create(mappedData);
      this.eventsGateway.server.emit('signalCreated', createdSignal);
      return createdSignal;
    } catch (error) {
      this.logger.error(`Error creating signal: `, error);
      throw error;
    }
  }

  async update(id: string, updateSignalDto: UpdateSignalDto): Promise<XRay> {
    try {
      const mappedData = this.mapDtoToSchema(updateSignalDto);
      const updatedSignal = await this.xrayRepository.update(id, mappedData);

      if (!updatedSignal)
        throw new NotFoundException(`Signal with ID ${id} not found`);

      this.eventsGateway.server.emit('signalUpdated', updatedSignal);
      return updatedSignal;
    } catch (error) {
      this.logger.error(`Error updating signal: `, error);
      throw error;
    }
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    try {
      const result = await this.xrayRepository.remove(id);

      if (!result)
        throw new NotFoundException(`Signal with ID ${id} not found`);

      return { deleted: true };
    } catch (error) {
      this.logger.error(`Error removing signal with ID ${id}`, error);
      return { deleted: false };
    }
  }

  async findAndPaginate(
    filter: FilterSignalDto,
  ): Promise<PaginatedResponseDto<XRay>> {
    try {
      const { items, total } = await this.xrayRepository.find(filter);
      return createPaginatedResponse(items, total, filter);
    } catch (error) {
      this.logger.error('Error filtering data with pagination', error);
      throw error;
    }
  }
}
