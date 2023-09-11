import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UtilsModule } from './utils/utils.module';
import { JwtModule } from './jwt/jwt.module';
import { ConfigModule } from '@nestjs/config';
import { validate } from './validate/env.validation';
// import { DataServicesModule } from './services/data-services/data-services.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './exceptions/httpExceptionFilter';
import { UsersModule } from './user/user.module';
import { BookmarkModule } from './bookmark/bookmark.module';
import { TagModule } from './tag/tag.module';
import Configuration from './config/configuration';
import { WinstonDailyModule } from './logger/winston.logger';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
      validate,
      load: [Configuration],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost', // 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME, // 'root',
      password: process.env.DB_PASSWORD, // 'test',
      database: process.env.DB_NAME || 'tagmark',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV !== 'production',
      //synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
      //migrations: [__dirname + '/**/migrations/*.js'],
      //migrationsTableName: 'migrations',
    }),
    // AuthModule,
    JwtModule.forRoot({
      privateKey: process.env.PRIVATE_KEY || 'privateKey',
      refreshPrivateKey: process.env.REFRESH_PRIVATE_KEY || 'refreshPrivateKey',
    }),
    UtilsModule,
    // DataServicesModule,
    UsersModule,
    BookmarkModule,
    TagModule,
    WinstonDailyModule
  ],
  providers: [
    Logger,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
