import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserService } from './user.service';
import { FastifyRequest } from 'fastify';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const user = await this.userService.findById(request.params.id);
    return request.session.get('user').id === user.id;
  }
}
