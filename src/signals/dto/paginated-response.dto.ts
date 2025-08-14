import { ApiProperty } from '@nestjs/swagger';
import { XRay } from '../schemas/xray.schema';

export class PaginatedResponseDto<T> {
  @ApiProperty({ description: 'List of items', isArray: true })
  items: T[];

  @ApiProperty({ description: 'Total number of items' })
  total: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Number of items per page' })
  limit: number;

  @ApiProperty({ description: 'Total number of pages' })
  totalPages: number;

  @ApiProperty({ description: 'Whether there is a next page' })
  hasNextPage: boolean;

  @ApiProperty({ description: 'Whether there is a previous page' })
  hasPreviousPage: boolean;
}

export class PaginatedXRayResponseDto extends PaginatedResponseDto<XRay> {
  @ApiProperty({ description: 'List of XRay items', type: [XRay] })
  declare items: XRay[];
}
