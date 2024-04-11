import { registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenvConfig({ path: `.env` });

const config = {
  type: `postgres`,
  url: `${process.env.NODE_ENV === 'test' ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL}`,
  entities: [
    process.env.NODE_ENV === 'test'
      ? '**/*.entity.ts'
      : 'dist/**/*.entity{.ts,.js}',
  ],
  migrations: ['migrations/*{.ts,.js}'],
  autoLoadEntities: true,
  synchronize: process.env.NODE_ENV === 'test',
};

export const typeOrmConfig = registerAs('typeorm', () => config);

export const connectionSource = new DataSource(config as DataSourceOptions);
