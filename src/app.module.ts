import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ProducerModule } from './producer/producer.module';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import { SignalsModule } from './signals/signals.module';
import { WebsocketModule } from './websocket/websocket.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigModule available globally
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    RabbitMQModule,
    SignalsModule,
    WebsocketModule,
    ProducerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
