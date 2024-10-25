import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 예외 처리: 여기서는 Prisma 오류를 잡고, 적절한 메시지를 사용자에게 반환
    response.status(400).json({
      statusCode: 400,
      message: `Prisma Client Error: ${exception.message}`,
      path: request.url,
    });
  }
}
