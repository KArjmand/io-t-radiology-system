import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaginatedResponseDto } from './dto/paginated-response.dto';
import { PaginationDto } from './dto/pagination.dto';
import { FilterSignalDto } from './dto/filter-signal.dto';
import { XRay } from './schemas/xray.schema';
import { EventsGateway } from '../websocket/events.gateway';

@Injectable()
export class SignalsService {
  private readonly logger = new Logger(SignalsService.name);

  constructor(
    @InjectModel(XRay.name) private xrayModel: Model<XRay>,
    private eventsGateway: EventsGateway,
  ) {}

  async processXRayData(message: any): Promise<void> {
    try {
      const data = JSON.parse(message.content.toString());
      const deviceId = Object.keys(data)[0];

      // Emit 'MessageReceived' event
      this.eventsGateway.emitProcessStep(deviceId, 'MessageReceived', {
        messageSize: message.content.length,
      });

      const { time, data: xrayData } = data[deviceId];

      // Emit 'Processing' event
      this.eventsGateway.emitProcessStep(deviceId, 'Processing', {
        dataPoints: xrayData.length,
      });

      const dataLength = xrayData.length;
      const dataVolume = JSON.stringify(xrayData).length;

      const xrayDocument = new this.xrayModel({
        deviceId,
        time,
        data: xrayData.map(([time, [x, y, speed]]) => ({
          time,
          coordinates: [x, y, speed],
        })),
        dataLength,
        dataVolume,
      });

      await xrayDocument.save();

      // Emit 'Saved' event
      this.eventsGateway.emitProcessStep(deviceId, 'Saved', {
        documentId: xrayDocument._id,
        dataLength,
        dataVolume,
      });

      this.logger.log(`Processed and saved x-ray data for device ${deviceId}`);
    } catch (error) {
      this.logger.error('Error processing x-ray data', error);

      // Emit 'Error' event if there's an error
      if (error.deviceId) {
        this.eventsGateway.emitProcessStep(error.deviceId, 'Error', {
          message: error.message,
        });
      }

      throw error;
    }
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<XRay>> {
    const { page, limit, skip } = paginationDto;

    try {
      const [items, total] = await Promise.all([
        this.xrayModel.find().skip(skip).limit(limit).exec(),
        this.xrayModel.countDocuments(),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        items,
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      };
    } catch (error) {
      this.logger.error('Error finding signals with pagination', error);
      throw error;
    }
  }

  async findByDeviceId(
    deviceId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<XRay> | XRay[]> {
    const { page, limit, skip } = paginationDto;

    try {
      const [items, total] = await Promise.all([
        this.xrayModel.find({ deviceId }).skip(skip).limit(limit).exec(),
        this.xrayModel.countDocuments({ deviceId }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        items,
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      };
    } catch (error) {
      this.logger.error(
        `Error finding signals for device ${deviceId} with pagination`,
        error,
      );
      throw error;
    }
  }

  async findOne(id: string): Promise<XRay> {
    try {
      const signal = await this.xrayModel.findById(id).exec();
      if (!signal) {
        throw new NotFoundException(`Signal with ID ${id} not found`);
      }
      return signal;
    } catch (error) {
      this.logger.error(`Error finding signal with ID ${id}`, error);
      throw error;
    }
  }

  async create(createSignalDto: any): Promise<XRay> {
    try {
      const newSignal = new this.xrayModel(createSignalDto);
      return await newSignal.save();
    } catch (error) {
      this.logger.error('Error creating signal', error);
      throw error;
    }
  }

  async update(id: string, updateSignalDto: any): Promise<XRay> {
    try {
      const updatedSignal = await this.xrayModel
        .findByIdAndUpdate(id, updateSignalDto, { new: true })
        .exec();

      if (!updatedSignal) {
        throw new NotFoundException(`Signal with ID ${id} not found`);
      }

      return updatedSignal;
    } catch (error) {
      this.logger.error(`Error updating signal with ID ${id}`, error);
      throw error;
    }
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    try {
      const result = await this.xrayModel.findByIdAndDelete(id).exec();

      if (!result) {
        throw new NotFoundException(`Signal with ID ${id} not found`);
      }

      return { deleted: true };
    } catch (error) {
      this.logger.error(`Error removing signal with ID ${id}`, error);
      return { deleted: false };
    }
  }

  async filterData(
    filterOptions: FilterSignalDto,
  ): Promise<PaginatedResponseDto<XRay> | XRay[]> {
    try {
      const { page, limit, skip, ...filters } = filterOptions;
      const query: any = {};

      if (filters.deviceId) {
        query.deviceId = filters.deviceId;
      }

      if (filters.startTime || filters.endTime) {
        query.time = {};

        if (filters.startTime) {
          query.time.$gte = filters.startTime;
        }

        if (filters.endTime) {
          query.time.$lte = filters.endTime;
        }
      }

      // If no pagination parameters provided, return all results
      if (!page && !limit) {
        return this.xrayModel.find(query).exec();
      }

      const [items, total] = await Promise.all([
        this.xrayModel.find(query).skip(skip).limit(limit).exec(),
        this.xrayModel.countDocuments(query),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        items,
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      };
    } catch (error) {
      this.logger.error('Error filtering data with pagination', error);
      throw error;
    }
  }
}
