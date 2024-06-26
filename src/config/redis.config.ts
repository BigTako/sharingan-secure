import { registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig({ path: `.env` });

const config = {
  type: 'single',
  url: process.env.REDIS_URL,
  expiration: process.env.JWT_EXPIRES_IN,
};

export const redisConfig = registerAs('redis', () => config);
