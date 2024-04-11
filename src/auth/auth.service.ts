import { Injectable, UnauthorizedException, Req } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';

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

  async login(): Promise<any> {
    return {
      message: 'Login successful',
    };
  }

  async logout(@Req() request: Request): Promise<any> {
    request.session.destroy(() => {
      return {
        message: 'Logout successful',
      };
    });
  }

  async signup({ id, name, password }) {
    const checkId = await this.userService.findById(id);
    if (checkId) return '이미 존재하는 email 입니다.';

    const hashPassword = await bcrypt.hash(password, 5);
    const user = {
      id: id,
      name: name,
      password: hashPassword,
      provider: 'local',
    };
    const response = await this.userService.create(user);
    if (!response) return '회원가입 실패';
    else return '회원가입 성공';
  }
}
