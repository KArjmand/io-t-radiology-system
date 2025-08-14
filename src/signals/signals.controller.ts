import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { CreateSignalDto } from './dto/create-signal.dto';
import { FilterSignalDto } from './dto/filter-signal.dto';
import { UpdateSignalDto } from './dto/update-signal.dto';
import { XRay } from './schemas/xray.schema';
import { SignalsService } from './signals.service';

@ApiTags('signals')
@Controller('signals')
@UsePipes(new ValidationPipe({ transform: true }))
export class SignalsController {
  constructor(private readonly signalsService: SignalsService) {}

  @Get('find-one/:id')
  @ApiOperation({ summary: 'Get signal by ID' })
  @ApiParam({ name: 'id', description: 'Signal ID' })
  @ApiResponse({ status: 200, description: 'Return the signal', type: XRay })
  @ApiResponse({ status: 404, description: 'Signal not found' })
  async findOne(@Param('id') id: string): Promise<XRay> {
    const signal = await this.signalsService.findOne(id);

    return signal;
  }

  @Post()
  @ApiOperation({ summary: 'Create new signal' })
  @ApiBody({ type: CreateSignalDto })
  @ApiResponse({
    status: 201,
    description: 'Signal created successfully',
    type: XRay,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createSignalDto: CreateSignalDto): Promise<XRay> {
    return this.signalsService.create(createSignalDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update signal' })
  @ApiParam({ name: 'id', description: 'Signal ID' })
  @ApiBody({ type: UpdateSignalDto })
  @ApiResponse({
    status: 200,
    description: 'Signal updated successfully',
    type: XRay,
  })
  @ApiResponse({ status: 404, description: 'Signal not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async update(
    @Param('id') id: string,
    @Body() updateSignalDto: UpdateSignalDto,
  ): Promise<XRay> {
    return this.signalsService.update(id, updateSignalDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete signal' })
  @ApiParam({ name: 'id', description: 'Signal ID' })
  @ApiResponse({ status: 200, description: 'Signal deleted successfully' })
  @ApiResponse({ status: 404, description: 'Signal not found' })
  async remove(@Param('id') id: string): Promise<{ deleted: boolean }> {
    return this.signalsService.remove(id);
  }

  @Get('find-all')
  @ApiOperation({ summary: 'Filter signals by criteria' })
  @ApiResponse({
    status: 200,
    description: 'Return filtered signals',
    type: PaginatedResponseDto<XRay>,
  })
  async findAndPaginate(
    @Query() filterDto: FilterSignalDto,
  ): Promise<PaginatedResponseDto<XRay>> {
    return this.signalsService.findAndPaginate(filterDto);
  }
}
