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
    if (!response) throw new UnauthorizedException('해당하는 유저가 없습니다.');

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
    if (checkId) return { status: 403, message: '이미 존재하는 아이디' };

    const hashPassword = await bcrypt.hash(password, 5);
    const user = {
      id: id,
      name: name,
      password: hashPassword,
      provider: 'local',
    };
    const response = await this.userService.create(user);
    if (!response) return { status: 403, message: '회원가입 실패' };
    else return { status: 201, message: '회원가입 성공' };
  }

  async checkId(id: string) {
    const checkId = await this.userService.findById(id);
    if (checkId)
      return { status: 403, success: false, message: '이미 존재하는 아이디' };
    return { status: 201, success: true, message: '사용가능한 아이디' };
  }

  async checkName(name: string) {
    const checkName = await this.userService.findByName(name);
    if (checkName)
      return { status: 403, success: false, message: '이미 존재하는 닉네임' };
    return { status: 201, success: true, message: '사용가능한 닉네임' };
  }
}
