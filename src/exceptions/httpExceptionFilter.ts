import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { winstonLogger } from '../logger/winston.logger';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const error: any = exception.getResponse();

    winstonLogger.error('Request url : ', request.url);
    winstonLogger.error('error Info : ', error);
    winstonLogger.error('Time : ', new Date().toISOString());

    let statusCode = status;
    if (error.status || error.statusCode) {
      statusCode = error.status || error.statusCode;
    }
    //valid에서 에러 반환하면 statusCode로 반환함.

    response.status(statusCode || 500).json({
      success: false,
      message: error.message || error,
    });
  }
}