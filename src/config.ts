import dotenv from 'dotenv';

dotenv.config();

export interface Config {
  appName: string;
  appDescription: string;
  host: string;
  port: number;
  baseUrl: string;
  cacheTtlSeconds: number;
  maxFeedSizeMb: number;
  requestTimeoutMs: number;
}

export const config: Config = {
  appName: process.env.APP_NAME || 'ShufflePod',
  appDescription: process.env.APP_DESCRIPTION || 'A service for creating shuffled and custom podcast feeds',
  host: process.env.HOST || '0.0.0.0',
  port: parseInt(process.env.PORT || '3000', 10),
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  cacheTtlSeconds: parseInt(process.env.CACHE_TTL_SECONDS || '3600', 10),
  maxFeedSizeMb: parseInt(process.env.MAX_FEED_SIZE_MB || '50', 10),
  requestTimeoutMs: parseInt(process.env.REQUEST_TIMEOUT_MS || '30000', 10),
};
