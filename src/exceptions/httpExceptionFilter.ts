import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  logger: typeof Logger;
  constructor() {
    this.logger = Logger;
  }
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const error: any = exception.getResponse();

    this.logger.error('Request url : ', request.url);
    this.logger.error('Request method : ', request.method);
    this.logger.error('error Info : ', error);
    this.logger.error('Time : ', new Date().toISOString());

    let statusCode = status;
    if (error.status || error.statusCode) {
      statusCode = error.status || error.statusCode;
    }

    response.status(statusCode || 500).json({
      success: false,
      message: error.message || error,
    });
  }
}
