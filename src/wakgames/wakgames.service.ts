import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WakGames } from '@wakgames/gamesdk';

@Injectable()
export class WakgamesService extends WakGames {
  constructor(private readonly configService: ConfigService) {
    super({
      clientId: configService.get<string>('CLIENT_ID'),
      redirectUrl: configService.get<string>('CALLBACK_URL'),
    });
  }

  handleOauth(): any {
    console.log('Authorize URL:', this.oauth.getAuthorizeUrl());
  }
  getSDK() {
    console.log(this);
  }
}
