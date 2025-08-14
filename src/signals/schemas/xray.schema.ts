import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema()
export class XRayData {
  @ApiProperty({ description: 'Time in milliseconds', example: 762 })
  @Prop({ required: true })
  time: number;

  @ApiProperty({
    description: 'Coordinates and speed data [x, y, speed]',
    example: [51.339764, 12.339223, 1.2038],
    type: [Number],
  })
  @Prop({ type: [Number], required: true })
  coordinates: [number, number, number]; // [x, y, speed]
}

@Schema({ timestamps: true })
export class XRay extends Document {
  @ApiProperty({
    description: 'Device ID',
    example: '66bb584d4ae73e488c30a072',
  })
  @Prop({ required: true })
  deviceId: string;

  @ApiProperty({
    description: 'Timestamp in milliseconds',
    example: 1735683480000,
  })
  @Prop({ required: true })
  time: number;

  @ApiProperty({
    description: 'Array of x-ray data points',
    type: [XRayData],
  })
  @Prop({ type: [XRayData], required: true })
  data: XRayData[];

  @ApiProperty({ description: 'Length of data array', example: 3 })
  @Prop({ required: true })
  dataLength: number;

  @ApiProperty({ description: 'Size of x-ray data in bytes', example: 256 })
  @Prop({ required: true })
  dataVolume: number;
}

export const XRaySchema = SchemaFactory.createForClass(XRay);
