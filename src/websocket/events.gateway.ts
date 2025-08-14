import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

type Step = 'MessageReceived' | 'Processing' | 'Saved' | 'Error';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  emitProcessStep(deviceId: string, step: Step, data?: unknown) {
    this.server.emit('processStep', {
      deviceId,
      step,
      timestamp: Date.now(),
      data,
    });
  }
}
