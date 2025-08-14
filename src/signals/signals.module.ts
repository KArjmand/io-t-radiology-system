import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SignalsService } from './signals.service';
import { SignalsController } from './signals.controller';
import { XRay, XRaySchema } from './schemas/xray.schema';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    MongooseModule.forFeature([{ name: XRay.name, schema: XRaySchema }]),
    WebsocketModule,
  ],
  controllers: [SignalsController],
  providers: [SignalsService],
  exports: [SignalsService],
})
export class SignalsModule {}
