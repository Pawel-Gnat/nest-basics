import { DataSource } from 'typeorm';
import { config as loadEnv } from 'dotenv';
import { buildTypeOrmOptions, NODE_ENV } from './config/typeorm.config';

loadEnv({ path: `.env.${NODE_ENV}` });

const dbName = process.env.DB_NAME;
if (!dbName) {
  throw new Error('DB_NAME is not set');
}

export const appDataSource = new DataSource({
  ...buildTypeOrmOptions(dbName),
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
});
