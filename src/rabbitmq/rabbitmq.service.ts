import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SignalsService } from '../signals/signals.service';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: amqp.ChannelModel;
  private channel: amqp.Channel;
  private readonly queueName: string; // Queue for x-ray data

  constructor(
    private configService: ConfigService,
    private signalsService: SignalsService,
  ) {
    this.queueName = this.configService.get<string>(
      'RABBITMQ_QUEUE',
      'xray_queue',
    );
  }

  async onModuleInit() {
    try {
      const user = this.configService.get<string>(
        'RABBITMQ_DEFAULT_USER',
        'admin',
      );
      const pass = this.configService.get<string>(
        'RABBITMQ_DEFAULT_PASS',
        'admin123',
      );
      const host = this.configService.get<string>('RABBITMQ_HOST', 'localhost');
      const port = this.configService.get<string>('RABBITMQ_PORT', '5672');
      const rabbitMQUrl = `amqp://${user}:${pass}@${host}:${port}`;
      this.connection = await amqp.connect(rabbitMQUrl);
      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue(this.queueName, { durable: true });
      this.logger.log('RabbitMQ connection established and queue asserted.');
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ', error);
      throw error;
    }
  }

  sendToQueue(data: any) {
    try {
      this.channel.sendToQueue(
        this.queueName,
        Buffer.from(JSON.stringify(data)),
        {
          persistent: true,
        },
      );
      this.logger.log('Message sent to queue');
    } catch (error) {
      this.logger.error('Error sending message to queue', error);
    }
  }
}
