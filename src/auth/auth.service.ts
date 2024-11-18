import {
  Injectable,
  UnauthorizedException,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';
import { WakgamesService } from 'src/wakgames/wakgames.service';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly wakgamesService: WakgamesService,
  ) {}

  async OAuthLogin(user) {
    try {
      const response = await this.userService.findById(user.id);
      if (!response) return await this.userService.create(user);
      return response;
    } catch (error) {
      throw new BadRequestException(
        'OAuth 로그인 처리 중 오류가 발생했습니다.',
      );
    }
  }

  async LocalLogin(user) {
    try {
      const response = await this.userService.findById(user.email || user.id);
      if (!response)
        throw new UnauthorizedException('해당하는 유저가 없습니다.');

      const passwordMatch: boolean = await this.passworMatch(
        user.password,
        response.password,
      );
      if (!passwordMatch)
        throw new UnauthorizedException('password is not equal');

      return response;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new BadRequestException('로그인 처리 중 오류가 발생했습니다.');
    }
  }

  async passworMatch(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  async logout(@Req() request: Request): Promise<any> {
    const { id, provider } = request.session.user;
    if (provider === 'guest') this.userService.deleteGuest(id);
    request.session.destroy(() => {});
    return { success: true, message: 'Logout Success' };
  }

  async signup({ id, name, password }) {
    try {
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
    } catch (error) {
      throw new BadRequestException('회원가입 처리 중 오류가 발생했습니다.');
    }
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

  async waktaOauth() {
    return this.wakgamesService.getAuth();
  }

  async waktaLogin(auth) {
    try {
      let { data, response } = await this.wakgamesService.getToken(auth);
      if (response.status !== 201) throw new UnauthorizedException();

      const { accessToken, refreshToken, idToken } = data;

      ({ data, response } = await this.wakgamesService.getProfile(accessToken));
      if (response.status === 400) throw new BadRequestException();

      const user = await this.userService.findById(String(idToken));
      if (!user) {
        const newUser = await this.userService.create({
          id: String(idToken),
          name: data.name,
          provider: 'waktaverse.games',
          password: undefined,
        });

        return {
          accessToken: accessToken as string,
          refreshToken: refreshToken as string,
          user: newUser,
        };
      } else {
        if (user.name !== data.name) {
          await this.userService.update(user.id, { name: data.name });
          user.name = data.name;
        }
      }

      return {
        accessToken: accessToken as string,
        refreshToken: refreshToken as string,
        user: user,
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new BadRequestException(
        '왁타버스 로그인 처리 중 오류가 발생했습니다.',
      );
    }
  }

  async waktaUpdateToken(token) {
    try {
      const data = await this.wakgamesService.updateToken(token);
      const { accessToken, refreshToken } = data;
      if (!accessToken || !refreshToken) throw new UnauthorizedException();
      return {
        accessToken: accessToken as string,
        refreshToken: refreshToken as string,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new BadRequestException('토큰 업데이트 중 오류가 발생했습니다.');
    }
  }

  async guestUser() {
    try {
      const user = {
        id: randomUUID(),
        name: '게스트' + Math.floor(Math.random() * 1000),
        provider: 'guest',
        password: null,
      };
      const newUser = await this.userService.create(user);
      return newUser;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      console.log(error);
      throw new BadRequestException('게스트 생성 중 오류가 발생했습니다.');
    }
  }
}
