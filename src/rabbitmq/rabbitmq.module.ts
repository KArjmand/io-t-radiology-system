import { Module } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { SignalsModule } from '../signals/signals.module';

@Module({
  imports: [SignalsModule],
  providers: [RabbitMQService],
  exports: [RabbitMQService],
})
export class RabbitMQModule {}
