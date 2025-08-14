import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  emitProcessStep(deviceId: string, step: string, data?: any) {
    this.server.emit('processStep', {
      deviceId,
      step,
      timestamp: Date.now(),
      data,
    });
  }
}
