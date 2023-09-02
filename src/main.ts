import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './exceptions/httpExceptionFilter';
import { setupSwagger } from './swagger';
import { winstonLogger } from './logger/winston.logger';
import { CustomLoggerService } from './logger/custom.logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    //logger: winstonLogger,
    bufferLogs: true,
  });
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors({
    origin: process.env.SERVER_HOST,
    credentials: true,
  });
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useLogger(app.get(CustomLoggerService));
  setupSwagger(app);

  await app.listen(process.env.PORT || 8080);
}

bootstrap();
