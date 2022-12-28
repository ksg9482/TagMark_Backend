import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from "@nestjs/common";
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();
        const error:any = exception.getResponse();

        console.log('요청 url : ', request.url);
        console.log('error 정보 : ', error);
        console.log('발생 시간 : ', new Date().toISOString());

        response.status(status).json({
            success: false,
            message: error.message,
        });
    }
}