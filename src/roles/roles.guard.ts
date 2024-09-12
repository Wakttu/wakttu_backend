import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FastifyRequest } from 'fastify';

import { Roles } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const roles = this.reflector.get(Roles, context.getHandler());
    if (!roles) return true;
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const user = request.session.get('user');
    if (!user) return false;
    return this.matchRoles(roles, user.provider);
  }

  matchRoles(roles: string[], provider?: string) {
    return roles.includes(provider);
  }
}
