import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserService } from './user.service';
import { FastifyRequest } from 'fastify';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = await context
      .switchToHttp()
      .getRequest<FastifyRequest<{ Params: { id: string } }>>();
    const { id } = request.params;
    const user = await this.userService.findById(id);
    return request.session.get('user').id === user.id;
  }
}
