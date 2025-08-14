import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
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
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateSignalDto } from './dto/create-signal.dto';
import { FilterSignalDto } from './dto/filter-signal.dto';
import { PaginatedXRayResponseDto } from './dto/paginated-response.dto';
import { PaginationDto } from './dto/pagination.dto';
import { UpdateSignalDto } from './dto/update-signal.dto';
import { XRay } from './schemas/xray.schema';
import { SignalsService } from './signals.service';

@ApiTags('signals')
@Controller('signals')
@UsePipes(new ValidationPipe({ transform: true }))
export class SignalsController {
  constructor(private readonly signalsService: SignalsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all signals' })
  @ApiQuery({ type: PaginationDto, required: false })
  @ApiResponse({
    status: 200,
    description: 'Return all signals',
    type: PaginatedXRayResponseDto,
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedXRayResponseDto | XRay[]> {
    return this.signalsService.findAll(paginationDto);
  }

  @Get('device/:deviceId')
  @ApiOperation({ summary: 'Get signals by device ID' })
  @ApiParam({ name: 'deviceId', description: 'Device ID' })
  @ApiQuery({ type: PaginationDto, required: false })
  @ApiResponse({
    status: 200,
    description: 'Return signals for specific device',
    type: PaginatedXRayResponseDto,
  })
  async findByDeviceId(
    @Param('deviceId') deviceId: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedXRayResponseDto | XRay[]> {
    return this.signalsService.findByDeviceId(deviceId, paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get signal by ID' })
  @ApiParam({ name: 'id', description: 'Signal ID' })
  @ApiResponse({ status: 200, description: 'Return the signal', type: XRay })
  @ApiResponse({ status: 404, description: 'Signal not found' })
  async findOne(@Param('id') id: string): Promise<XRay> {
    const signal = await this.signalsService.findOne(id);
    if (!signal)
      throw new HttpException('Signal not found', HttpStatus.NOT_FOUND);

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

  @Get('filter/data')
  @ApiOperation({ summary: 'Filter signals by criteria' })
  @ApiResponse({
    status: 200,
    description: 'Return filtered signals',
    type: PaginatedXRayResponseDto,
  })
  async filterData(
    @Query() filterDto: FilterSignalDto,
  ): Promise<PaginatedXRayResponseDto | XRay[]> {
    return this.signalsService.filterData(filterDto);
  }
}
