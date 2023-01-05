import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from "@nestjs/common";
import { Request, Response } from 'express';
import { winstonLogger } from "./winston.logger";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();
        const error:any = exception.getResponse();

        winstonLogger.error('요청 url : ', request.url);
        winstonLogger.error('error 정보 : ', error);
        winstonLogger.error('발생 시간 : ', new Date().toISOString());
        response.status(status).json({
            success: false,
            message: error
        });
    }
}