import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UtilsModule } from './utils/utils.module';
import { JwtModule } from './jwt/jwt.module';
import { ConfigModule } from '@nestjs/config';
import { validate } from './utils/validate/env.validation';
import { DataServicesModule } from './services/data-services/data-services.module';
import { UserUsecasesModule } from './use-cases/user';
import { BookmarkUsecasesModule } from './use-cases/bookmark';
import { TagUsecasesModule } from './use-cases/tag';
import { BookmarkController, TagController, UserController } from './controllers';
import { LoggerMiddleware } from './logger/logger.middleware';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './utils/httpExceptionFilter';
import { CommonController } from './controllers/common.controller';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
      validate
    }),
    AuthModule,
    JwtModule.forRoot({
      privateKey: process.env.PRIVATE_KEY,
      refreshPrivateKey: process.env.REFRESH_PRIVATE_KEY
    }),
    UtilsModule,
    DataServicesModule,
    UserUsecasesModule,
    BookmarkUsecasesModule,
    TagUsecasesModule,
  ],
  controllers: [
    UserController,
    BookmarkController,
    TagController,
    CommonController
  ],
  providers: [
    Logger,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    }
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
