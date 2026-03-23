import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';

export const NODE_ENV = process.env.NODE_ENV ?? 'development';

export function buildTypeOrmOptions(dbName: string): DataSourceOptions {
  const isTest = NODE_ENV === 'test';
  const isProduction = NODE_ENV === 'production';

  return {
    type: 'sqlite',
    database: dbName,
    synchronize: isTest,
    migrationsRun: isProduction,
    logging: !isProduction,
  };
}

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const dbName = this.configService.get<string>('DB_NAME');
    if (!dbName) {
      throw new Error('DB_NAME is not set');
    }

    return {
      ...buildTypeOrmOptions(dbName),
      autoLoadEntities: true,
    };
  }
}
