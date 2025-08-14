export type Coordinates = [x: number, y: number, speed: number];
export interface XRayDataPoint {
  time: number;
  coordinates: Coordinates;
}

export interface XRayMessageData {
  time: number;
  data: Array<[number, Coordinates]>;
}

export type XRayMessage = {
  [deviceId: string]: XRayMessageData;
};

// Type for the RabbitMQ message (amqplib)
export interface RabbitMQMessage {
  content: Buffer;
}
