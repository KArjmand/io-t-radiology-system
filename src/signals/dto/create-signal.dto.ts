import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

class CoordinateDto {
  @ApiProperty({ description: 'X coordinate', example: 51.339764 })
  @IsNumber()
  x: number;

  @ApiProperty({ description: 'Y coordinate', example: 12.339223 })
  @IsNumber()
  y: number;

  @ApiProperty({ description: 'Speed', example: 1.2038 })
  @IsNumber()
  speed: number;
}

class XRayDataPointDto {
  @ApiProperty({ description: 'Time in milliseconds', example: 762 })
  @IsNumber()
  time: number;

  @ApiProperty({
    description: 'Coordinates and speed data',
    type: CoordinateDto,
  })
  @ValidateNested()
  @Type(() => CoordinateDto)
  coordinates: CoordinateDto;
}

export class CreateSignalDto {
  @ApiProperty({
    description: 'Device ID',
    example: '66bb584d4ae73e488c30a072',
  })
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @ApiProperty({
    description: 'Timestamp in milliseconds',
    example: 1735683480000,
  })
  @IsNumber()
  time: number;

  @ApiProperty({
    description: 'Array of x-ray data points',
    type: [XRayDataPointDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => XRayDataPointDto)
  data: XRayDataPointDto[];

  @ApiProperty({ description: 'Length of data array', example: 3 })
  @IsNumber()
  dataLength: number;

  @ApiProperty({ description: 'Size of x-ray data in bytes', example: 256 })
  @IsNumber()
  dataVolume: number;
}
