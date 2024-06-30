import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WakGames } from '@wakgames/gamesdk';

type grantType = 'authorization_code';

export type stats = {
  id: string;
  val: number;
}[];

@Injectable()
export class WakgamesService extends WakGames {
  constructor(private readonly configService: ConfigService) {
    super({
      clientId: configService.get<string>('CLIENT_ID'),
      redirectUrl: configService.get<string>('CALLBACK_URL'),
    });
  }

  getAuth(): object {
    return this.oauth.getAuthorizeUrl();
  }

  async getToken(auth) {
    const query = {
      grantType: 'authorization_code' as grantType,
      clientId: this.clientId,
      code: auth.code,
      verifier: auth.codeVerifier,
      callbackUri: this.redirectUrl,
    };
    return await this.oauth.token(query);
  }

  async updateToken(refreshToken: string) {
    return await this.oauth.refresh(refreshToken);
  }

  async getProfile(accessToken: string) {
    return await this.gameLink.getProfile(accessToken);
  }

  async getAchieve(accessToken: string) {
    return await this.gameLink.getAchieves(accessToken);
  }

  async postAchieve(id: string, accessToken: string) {
    return await this.gameLink.postAchieve({ id }, accessToken);
  }

  async getStat(id: string, accessToken: string) {
    return await this.gameLink.getStat({ id }, accessToken);
  }

  async putStat(stats: stats, accessToken: string) {
    return await this.gameLink.putStat({ stats }, accessToken);
  }
}
