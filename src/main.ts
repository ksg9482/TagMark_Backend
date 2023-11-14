import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './exceptions/httpExceptionFilter';
import { setupSwagger } from './swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

export function setNestApp<T extends INestApplication>(app: T): void {
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors({
    origin: process.env.SERVER_HOST,
    credentials: true,
  });
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      skipMissingProperties: true,
      forbidNonWhitelisted: true,
      transform: true,
      stopAtFirstError: true,
    }),
  );
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  setNestApp(app);
  setupSwagger(app);

  await app.listen(process.env.PORT || 8080);
}

bootstrap();
