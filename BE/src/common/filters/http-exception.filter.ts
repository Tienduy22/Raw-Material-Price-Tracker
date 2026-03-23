import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { Response } from 'express';
import { ApiResponse } from "../responses/api-response";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp()
        const response = ctx.getResponse<Response>()

        let statusCode = HttpStatus.INTERNAL_SERVER_ERROR
        let message = 'Lỗi hệ thống, vui lòng thử lại sau'

        if (exception instanceof HttpException) {
            statusCode = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'object' && 'message' in exceptionResponse) {
                const msg = (exceptionResponse as any).message
                message = Array.isArray(msg) ? msg[0] : msg;
            } else {
                message = exception.message;
            }
        }

        response.status(statusCode).json(
            new ApiResponse(false, statusCode, message, null)
        )
    }
}