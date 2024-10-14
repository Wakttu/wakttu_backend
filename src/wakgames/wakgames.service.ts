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

      const statId = this.getId(item.word);
      if (statId.length === 0) return;

      statId.forEach((id) => {
        const count = map.get(id);
        map.set(id, count ? count + 1 : 1);
      });
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

  getId(word: { type: string; id: string; [x: string]: any }) {
    const id = [];
    switch (word.type) {
      case 'WOO': {
        id.push('WOO-1');
        break;
      }
      case 'INE': {
        id.push('INE-1');
        this.getINE(id, word);
        break;
      }
      case 'JINGBURGER': {
        id.push('JING-1');
        this.getJING(id, word);
        break;
      }
      case 'LILPA': {
        id.push('LIL-1');
        this.getLIL(id, word);
        break;
      }
      case 'JURURU': {
        id.push('JU-1');
        this.getJU(id, word);
        break;
      }
      case 'GOSEGU': {
        id.push('GO-1');
        this.getGO(id, word);
        break;
      }
      case 'VIICHAN': {
        id.push('VIi-1');
        this.getVIi(id, word);
        break;
      }
      case 'GOMEM': {
        this.getGomem(id, word);
        break;
      }
    }
    return id;
  }

  getINE(id: string[], word: { id: string; [x: string]: any }) {
    if (word.id === '오야') id.push('INE-2');
  }

  getJING(id: string[], word: { id: string; [x: string]: any }) {
    if (word.meta.tag.includes('어록')) id.push('JING-2');
  }

  getLIL(id: string[], word: { id: string; [x: string]: any }) {
    if (word.id === '띨파') id.push('LIL-2');
  }

  getJU(id: string[], word: { id: string; [x: string]: any }) {
    if (word.id === '띨르르') id.push('JU-2');
  }

  getGO(id: string[], word: { id: string; [x: string]: any }) {
    if (word.meta.tag.includes('콘텐츠')) id.push('GO-2');
  }

  getVIi(id: string[], word: { id: string; [x: string]: any }) {
    if (word.id.includes('복숭아')) id.push('VIi-2');
  }

  getGomem(id: string[], word: { id: string; [x: string]: any }) {
    if (word.meta.tag.includes('고멤')) id.push('GOM-1');
    if (word.meta.tag.includes('아카데미')) id.push('GOM-2');
  }
}
