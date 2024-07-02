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

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly wakgamesService: WakgamesService,
  ) {}

  async OAuthLogin(user) {
    const response = await this.userService.findById(user.id);
    if (!response) return await this.userService.create(user);

    return response;
  }

  async LocalLogin(user) {
    const response = await this.userService.findById(user.email || user.id);
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

  async logout(@Req() request: Request): Promise<any> {
    request.session.destroy(() => {});
    return 'Logout Success';
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

  async waktaOauth() {
    return this.wakgamesService.getAuth();
  }

  async waktaLogin(auth) {
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
    }

    return {
      accessToken: accessToken as string,
      refreshToken: refreshToken as string,
      user: user,
    };
  }

  async waktaUpdateToken(token) {
    const data = await this.wakgamesService.updateToken(token);
    const { accessToken, refreshToken } = data;
    if (!accessToken || !refreshToken) throw new UnauthorizedException();
    return {
      accessToken: accessToken as string,
      refreshToken: refreshToken as string,
    };
  }
}
