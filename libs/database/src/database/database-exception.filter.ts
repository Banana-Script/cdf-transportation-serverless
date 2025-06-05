import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { QueryFailedError } from 'typeorm';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: any, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();
    let httpStatus;
    let responseBody;
    if (exception instanceof QueryFailedError) {
      switch (exception.driverError.code) {
        case 'ER_DUP_ENTRY':
          httpStatus = HttpStatus.CONFLICT;
          break;
        default:
          httpStatus = HttpStatus.BAD_REQUEST;
          break;
      }
      responseBody = {
        statusCode: httpStatus,
        message: JSON.stringify(exception.message),
        timestamp: new Date().toISOString(),
        path: httpAdapter.getRequestUrl(ctx.getRequest()),
      };
    } else {
      httpStatus =
        exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
      console.log('error ', exception);
      responseBody = {
        statusCode: httpStatus,
        message: exception.getResponse(),
        timestamp: new Date().toISOString(),
        path: httpAdapter.getRequestUrl(ctx.getRequest()),
      };
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
