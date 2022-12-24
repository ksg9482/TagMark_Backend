import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './utils/httpExceptionFilter';
import { setupSwagger } from './utils/swagger';
import { winstonLogger } from './utils/winston.logger';


async function bootstrap() {
  const app = await NestFactory.create(AppModule,
    winstonLogger
  );
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true
  });
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter);
  setupSwagger(app)
  await app.listen(process.env.PORT || 8080);
}
bootstrap();
