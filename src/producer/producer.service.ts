import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import * as fs from 'fs';
import * as path from 'path';

interface XRayData {
  [deviceId: string]: {
    data: Array<[number, [number, number, number]]>;
    time: number;
  };
}

@Injectable()
export class ProducerService implements OnModuleInit {
  private readonly logger = new Logger(ProducerService.name);
  private sampleData: XRayData;

  constructor(private readonly rabbitMQService: RabbitMQService) {}

  onModuleInit() {
    try {
      // Load sample data
      this.loadSampleData();
    } catch (error) {
      this.logger.error('Failed to initialize producer service', error);
    }
  }

  private loadSampleData() {
    try {
      // Try to load sample data from the data directory
      const dataPath = path.join(
        process.cwd(),
        'data',
        'sample-xray-data.json',
      );
      if (fs.existsSync(dataPath)) {
        const rawData = fs.readFileSync(dataPath, 'utf8');
        this.sampleData = JSON.parse(rawData) as XRayData;
        this.logger.log('Sample data loaded successfully');
      } else {
        // If file doesn't exist, use hardcoded sample data
        this.sampleData = {
          '66bb584d4ae73e488c30a072': {
            data: [
              [762, [51.339764, 12.339223833333334, 1.2038000000000002]],
              [1766, [51.33977733333333, 12.339211833333334, 1.531604]],
              [2763, [51.339782, 12.339196166666667, 2.13906]],
            ],
            time: 1735683480000,
          },
        };
        this.logger.log('Using default sample data');
      }
    } catch (error) {
      this.logger.error('Error loading sample data', error);
      throw error;
    }
  }

  sendSampleData() {
    try {
      this.rabbitMQService.sendToQueue(this.sampleData);
      this.logger.log('Sample data sent to queue');
      return { success: true, message: 'Sample data sent to queue' };
    } catch (error) {
      this.logger.error('Error sending sample data', error);
      return { success: false, message: 'Failed to send sample data' };
    }
  }

  generateAndSendRandomData(deviceId?: string) {
    try {
      const generatedData = this.generateRandomXRayData(deviceId);
      this.rabbitMQService.sendToQueue(generatedData);
      this.logger.log('Random data sent to queue');
      return {
        success: true,
        message: 'Random data sent to queue',
        data: generatedData,
      };
    } catch (error) {
      this.logger.error('Error sending random data', error);
      return { success: false, message: 'Failed to send random data' };
    }
  }

  private generateRandomXRayData(customDeviceId?: string) {
    const deviceId =
      customDeviceId || `device_${Math.floor(Math.random() * 1000)}`;
    const dataPoints = Math.floor(Math.random() * 10) + 5; // 5-15 data points
    const data: Array<[number, [number, number, number]]> = [];

    let time = 0;
    for (let i = 0; i < dataPoints; i++) {
      time += Math.floor(Math.random() * 1000) + 500; // 500-1500ms intervals
      const x = 51.33 + Math.random() * 0.01;
      const y = 12.33 + Math.random() * 0.01;
      const speed = Math.random() * 3 + 0.5; // 0.5-3.5 speed

      data.push([time, [x, y, speed]]);
    }

    return {
      [deviceId]: {
        data,
        time: Date.now(),
      },
    };
  }
}
