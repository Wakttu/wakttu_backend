import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async OAuthLogin(user) {
    const response = await this.userService.findById(user.id);
    if (!response) return await this.userService.create(user);

    return response;
  }

  async LocalLogin(user) {
    const response = await this.userService.findById(user.id);
    const passwordMatch: boolean = await this.passworMatch(
      user.password,
      response.password,
    );
    if (!passwordMatch)
      throw new UnauthorizedException('password is not equal');

    return response;
  }

  async passworMatch(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
