import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { BookmarkModule } from './bookmark/bookmark.module';
import Configuration from './config/configuration';
import { HttpExceptionFilter } from './exceptions/httpExceptionFilter';
import { JwtModule } from './jwt/jwt.module';
import { WinstonDailyModule } from './logger/winston.logger';
import { JwtMiddleware } from './middlewares/jwt.middleware';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { TagModule } from './tag/tag.module';
import { UsersModule } from './user/user.module';
import { UtilsModule } from './utils/utils.module';
import { validate } from './validate/env.validation';

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
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'tagmark',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
      // logging: process.env.NODE_ENV !== 'production',
    }),
    AuthModule,
    JwtModule.forRoot({
      privateKey: process.env.PRIVATE_KEY || 'privateKey',
      refreshPrivateKey: process.env.REFRESH_PRIVATE_KEY || 'refreshPrivateKey',
    }),
    UtilsModule,
    UsersModule,
    BookmarkModule,
    TagModule,
    WinstonDailyModule,
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
    consumer.apply(LoggerMiddleware, JwtMiddleware).forRoutes('*');
  }
}
