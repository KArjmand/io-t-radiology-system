import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { ProducerService } from './producer.service';
import { SendRandomDataDto } from './dto/producer.dto';

@ApiTags('producer')
@Controller('producer')
export class ProducerController {
  constructor(private readonly producerService: ProducerService) {}

  @Post('send-sample')
  @ApiOperation({ summary: 'Send sample x-ray data to RabbitMQ' })
  @ApiResponse({ status: 200, description: 'Sample data sent successfully' })
  sendSampleData() {
    return this.producerService.sendSampleData();
  }

  @Post('send-random')
  @ApiOperation({ summary: 'Generate and send random x-ray data to RabbitMQ' })
  @ApiBody({ type: SendRandomDataDto })
  @ApiResponse({ status: 200, description: 'Random data sent successfully' })
  sendRandomData(@Body() body: SendRandomDataDto) {
    return this.producerService.generateAndSendRandomData(body.deviceId);
  }

  @Get('generate')
  @ApiOperation({ summary: 'Generate random x-ray data and send to RabbitMQ' })
  @ApiQuery({
    name: 'deviceId',
    required: false,
    description: 'Optional device ID for the generated data',
  })
  @ApiResponse({
    status: 200,
    description: 'Random data generated and sent successfully',
  })
  generateRandomData(@Query('deviceId') deviceId?: string) {
    return this.producerService.generateAndSendRandomData(deviceId);
  }
}
