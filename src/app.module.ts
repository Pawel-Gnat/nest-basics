import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ReportsModule } from './reports/reports.module';

import cookieSession from 'cookie-session';
import { ConfigModule, ConfigService } from '@nestjs/config';
import dbConfig from '../ormconfig';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    TypeOrmModule.forRoot(dbConfig),
    UsersModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: false },
      }),
    },
  ],
})
export class AppModule {
  constructor(private configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    const cookieKey = this.configService.get<string>('COOKIE_KEY');
    if (!cookieKey) {
      throw new Error('COOKIE_KEY is not set');
    }

    consumer
      .apply(
        cookieSession({
          keys: [cookieKey],
          maxAge: 24 * 60 * 60 * 1000,
        }),
      )
      .forRoutes('*');
  }
}
