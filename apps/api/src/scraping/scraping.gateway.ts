import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

export interface ScrapingStatusEvent {
  isRunning: boolean;
}

export interface ScrapingCompletedEvent {
  newJobs: number;
  sourcesRun: number;
}

const corsOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173').split(',').map((origin) => origin.trim());

@WebSocketGateway({ cors: { origin: corsOrigins } })
export class ScrapingGateway {
  @WebSocketServer()
  server: Server;

  broadcastStatus(payload: ScrapingStatusEvent) {
    this.server?.emit('scraping:status', payload);
  }

  broadcastCompleted(payload: ScrapingCompletedEvent) {
    this.server?.emit('scraping:completed', payload);
  }
}
