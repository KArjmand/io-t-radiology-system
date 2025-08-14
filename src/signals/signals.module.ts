import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SignalsService } from './signals.service';
import { SignalsController } from './signals.controller';
import { XRay, XRaySchema } from './schemas/xray.schema';
import { WebsocketModule } from '../websocket/websocket.module';
import { XRayRepository } from './xray.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: XRay.name, schema: XRaySchema }]),
    WebsocketModule,
  ],
  controllers: [SignalsController],
  providers: [SignalsService, XRayRepository],
  exports: [SignalsService],
})
export class SignalsModule {}
