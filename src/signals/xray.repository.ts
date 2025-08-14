import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FilterSignalDto } from './dto/filter-signal.dto';
import { XRay } from './schemas/xray.schema';

@Injectable()
export class XRayRepository {
  constructor(@InjectModel(XRay.name) private xrayModel: Model<XRay>) {}

  async create(xrayData: Partial<XRay>): Promise<XRay> {
    const xrayDocument = new this.xrayModel(xrayData);
    return await xrayDocument.save();
  }

  async find(
    filter: FilterSignalDto,
  ): Promise<{ items: XRay[]; total: number }> {
    const { limit, skip, deviceId, startTime, endTime } = filter;

    const query = {
      ...(deviceId && { deviceId }),
      ...(startTime || endTime
        ? {
            time: {
              ...(startTime && { $gte: startTime }),
              ...(endTime && { $lte: endTime }),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.xrayModel.find(query).skip(skip).limit(limit).exec(),
      this.xrayModel.countDocuments(query),
    ]);

    return { items, total };
  }

  async findOne(id: string): Promise<XRay | null> {
    return await this.xrayModel.findById(id).exec();
  }

  async update(id: string, updateData: Partial<XRay>): Promise<XRay | null> {
    return await this.xrayModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.xrayModel.findByIdAndDelete(id).exec();
    return result !== null;
  }
}
