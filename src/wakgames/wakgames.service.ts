import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WakGames } from '@wakgames/backend-sdk';

type grantType = 'authorization_code';

export type stats = {
  id: string;
  val: number;
}[];

interface WordData {
  type: string;
  id: string;
  meta?: {
    tag: string[];
  };
  [key: string]: any;
}

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

  private async refreshTokenIfNeeded(session: Record<string, any>) {
    const { data, response } = await this.updateToken(session.refreshToken);
    if (response.status !== 200) throw new UnauthorizedException();
    session.accessToken = data.accessToken;
    session.refreshToken = data.refreshToken;
    return session.accessToken;
  }

  async putResult(body: [], session: Record<string, any>) {
    const map = new Map<string, number>();
    body.forEach((item: { type: string; word: any }) => {
      if (item.type !== 'WORD') return;
      const statId = this.getId(item.word);
      statId.forEach((id) => {
        map.set(id, (map.get(id) || 0) + 1);
      });
    });

    try {
      const statsPromises = Array.from(map.entries()).map(
        async ([key, increment]) => {
          try {
            const { data, response } = await this.getStat(
              { id: key },
              session.accessToken,
            );
            if (response.status === 401) {
              const newToken = await this.refreshTokenIfNeeded(session);
              const { data } = await this.getStat({ id: key }, newToken);
              const val = data.size > 0 ? data.stats[0].val : 0;
              return { id: key, val: val + increment };
            }
            const val = data.size > 0 ? data.stats[0].val : 0;
            return { id: key, val: val + increment };
          } catch (error) {
            console.error(`Error fetching stat for key ${key}:`, error);
            throw error;
          }
        },
      );

      const stats = await Promise.all(statsPromises);

      try {
        const { data, response } = await this.putStat(
          { stats },
          session.accessToken,
        );
        if (response.status === 401) {
          const newToken = await this.refreshTokenIfNeeded(session);
          return await this.putStat({ stats }, newToken);
        }
        return data;
      } catch (error) {
        console.error('Error updating stats:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in putResult:', error);
      throw error;
    }
  }

  private readonly typeHandlers = new Map<string, (word: WordData) => string[]>(
    [
      ['WOO', () => ['WOO-1']],
      ['INE', (word) => ['INE-1', ...(word.id === '오야' ? ['INE-2'] : [])]],
      [
        'JINGBURGER',
        (word) => [
          'JING-1',
          ...(word.meta?.tag.includes('어록') ? ['JING-2'] : []),
        ],
      ],
      ['LILPA', (word) => ['LIL-1', ...(word.id === '띨파' ? ['LIL-2'] : [])]],
      ['JURURU', (word) => ['JU-1', ...(word.id === '띨르르' ? ['JU-2'] : [])]],
      [
        'GOSEGU',
        (word) => [
          'GO-1',
          ...(word.meta?.tag.includes('콘텐츠') ? ['GO-2'] : []),
        ],
      ],
      [
        'VIICHAN',
        (word) => ['VIi-1', ...(word.id.includes('복숭아') ? ['VIi-2'] : [])],
      ],
      [
        'GOMEM',
        (word) => [
          ...(word.meta?.tag.includes('고멤') ? ['GOM-1'] : []),
          ...(word.meta?.tag.includes('아카데미') ? ['GOM-2'] : []),
        ],
      ],
    ],
  );

  getId(word: WordData): string[] {
    const handler = this.typeHandlers.get(word.type);
    return handler ? handler(word) : [];
  }
}
