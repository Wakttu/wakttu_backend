import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WakGames } from '@wakgames/gamesdk';

type grantType = 'authorization_code';

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

  async getProfile({ accessToken, refreshToken, idToken }) {}

  getSDK() {
    console.log(this);
  }
}
