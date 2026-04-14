import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import {
  ValidationErrorItem,
  UniqueConstraintError,
  ValidationError,
} from 'sequelize';

type ErrorPayload = {
  success: false;
  statusCode: number;
  message: string;
  errorCode: string;
  details?: unknown;
  path: string;
  timestamp: string;
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let details: unknown;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const responseObj = exceptionResponse as {
          message?: string | string[];
          error?: string;
          details?: unknown;
        };

        if (Array.isArray(responseObj.message)) {
          message = responseObj.message.join(', ');
          details = responseObj.message;
        } else if (responseObj.message) {
          message = responseObj.message;
        }

        errorCode = responseObj.error?.toUpperCase().replace(/\s+/g, '_') ?? 'HTTP_EXCEPTION';
      }
    } else if (exception instanceof UniqueConstraintError) {
      statusCode = HttpStatus.CONFLICT;
      const firstField = exception.errors?.[0]?.path;
      message = firstField ? `${firstField} already exists` : 'Duplicate value violates unique constraint';
      errorCode = firstField ? `DUPLICATE_${firstField.toUpperCase()}` : 'UNIQUE_CONSTRAINT';
      details = exception.errors?.map((err: ValidationErrorItem) => ({
        field: err.path,
        message: err.message,
        value: err.value,
      }));
    } else if (exception instanceof ValidationError) {
      statusCode = HttpStatus.BAD_REQUEST;
      message = 'Validation failed';
      errorCode = 'VALIDATION_ERROR';
      details = exception.errors?.map((err: ValidationErrorItem) => ({
        field: err.path,
        message: err.message,
        value: err.value,
      }));
    }

    const payload: ErrorPayload = {
      success: false,
      statusCode,
      message,
      errorCode,
      ...(details ? { details } : {}),
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    response.status(statusCode).send(payload);
  }
}