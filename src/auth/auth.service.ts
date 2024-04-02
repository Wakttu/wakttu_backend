import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async OAuthLogin(user) {
    const response = await this.userService.findById(user.id);

    if (!response) return await this.userService.create(user);

    return response;
  }
}
