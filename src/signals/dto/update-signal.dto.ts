import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateSignalDto } from './create-signal.dto';
import { IsMongoId } from 'class-validator';

export class UpdateSignalDto extends PartialType(CreateSignalDto) {
  @ApiProperty({
    description: 'Signal ID',
    example: '60d21b4667d0d8992e610c85',
  })
  @IsMongoId()
  id: string;
}
