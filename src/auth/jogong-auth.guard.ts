import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class IsJogongGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canActivate(context: ExecutionContext): boolean {
    const NODE_ENV = this.configService.get<string>('NODE_ENV');

    if (NODE_ENV === 'jogong') {
      throw new ForbiddenException(
        'Access to this resource is forbidden in the current environment.',
      );
    }

    return true;
  }
}
