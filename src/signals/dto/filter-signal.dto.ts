import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from './pagination.dto';

export class FilterSignalDto extends PaginationDto {
  @ApiProperty({
    description: 'Start time in milliseconds',
    example: 1735683000000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  startTime?: number;

  @ApiProperty({
    description: 'End time in milliseconds',
    example: 1735683999999,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  endTime?: number;

  @ApiProperty({
    description: 'Device ID',
    example: '66bb584d4ae73e488c30a072',
    required: false,
  })
  @IsOptional()
  @IsString()
  deviceId?: string;
}
