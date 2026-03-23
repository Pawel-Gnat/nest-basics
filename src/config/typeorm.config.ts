import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';

export const NODE_ENV = process.env.NODE_ENV ?? 'development';

export function buildTypeOrmOptions(dbName: string): DataSourceOptions {
  return {
    type: 'sqlite',
    database: dbName,
    synchronize: NODE_ENV === 'test',
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
