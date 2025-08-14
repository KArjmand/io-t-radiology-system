import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SendRandomDataDto {
  @ApiProperty({
    description: 'Optional device ID for the generated data',
    example: '66bb584d4ae73e488c30a072',
    required: false,
  })
  @IsOptional()
  @IsString()
  deviceId?: string;
}
