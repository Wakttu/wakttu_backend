import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WakGames } from '@wakgames/backend-sdk';

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

  async postAchieve(query: any, accessToken: string) {
    return await this.gameLink.postAchieve(query, accessToken);
  }

  async getStat(query, accessToken: string) {
    return await this.gameLink.getStat(query, accessToken);
  }

  async putStat(body: any, accessToken: string) {
    return await this.gameLink.putStat(body, accessToken);
  }

  async putResult(body: [], session: Record<string, any>) {
    const map = new Map<string, number>();

    body.forEach((item: { type: string; [x: string]: any }) => {
      if (item.type !== 'WORD') return;
      const { type } = item.word;
      const statId = this.getId(type);
      if (statId === '') return;
      const count = map.get(statId);
      map.set(statId, count ? count + 1 : 1);
    });

    const stats = [];

    for (const key of map.keys()) {
      const { data, response } = await this.getStat(
        { id: key },
        session.accessToken,
      );

      if (response.status === 401) {
        const { data, response } = await this.updateToken(session.refreshToken);
        if (response.status !== 200) throw new UnauthorizedException();
        session.accessToken = data.accessToken;
        session.refreshToken = data.refreshToken;
      }
      const val = data.size > 0 ? data.stats[0].val : 0;
      stats.push({ id: key, val: val + map.get(key) });
    }
    const { data, response } = await this.putStat(
      { stats },
      session.accessToken,
    );

    if (response.status === 401) {
      const { data, response } = await this.updateToken(session.refreshToken);
      if (response.status !== 200) throw new UnauthorizedException();
      session.accessToken = data.accessToken;
      session.refreshToken = data.refreshToken;
      return await this.putStat({ stats }, session.accessToken);
    }
    return { data, response };
  }

  getId(type: string) {
    let id = '';
    switch (type) {
      case 'WOO': {
        id = 'WOO-1';
        break;
      }
      case 'INE': {
        id = 'INE-1';
        break;
      }
      case 'JINGBURGER': {
        id = 'JING-1';
        break;
      }
      case 'LILPA': {
        id = 'LIL-1';
        break;
      }
      case 'JURURU': {
        id = 'JU-1';
        break;
      }
      case 'GOSEGU': {
        id = 'GO-1';
        break;
      }
      case 'VIICHAN': {
        id = 'VIi-1';
        break;
      }
    }
    return id;
  }
}
