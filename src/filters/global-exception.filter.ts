import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  error: string;
  messages: string[];
}

// format exception of response and than send it
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const { statusCode, error, message } = exception.response;
    const res: ErrorResponse = {
      statusCode,
      error,
      messages: Array.isArray(message) ? message : [message],
    };

    response.status(exception.status).json(res);
  }
}
