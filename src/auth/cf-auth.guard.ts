import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import * as jwksClient from 'jwks-rsa';

@Injectable()
export class CloudflareGuard implements CanActivate {
  private readonly client: jwksClient.JwksClient;
  private readonly logger = new Logger(CloudflareGuard.name);

  constructor(config: ConfigService) {
    const domain = config.get('CLOUD_DOMAIN');
    this.client = jwksClient({
      jwksUri: `https://${domain}/cdn-cgi/access/certs`,
      cache: true,
      cacheMaxEntries: 5,
      cacheMaxAge: 10 * 60 * 1000,
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      this.logger.error('JWT 없음: Authorization 헤더가 비어 있습니다.');
      return false;
    }

    try {
      const decoded = await this.verifyToken(token);
      request.user = decoded;
      this.logger.log('JWT 검증 성공');
      return true;
    } catch (error) {
      this.logger.error('JWT 검증 실패:', error.message);
      return false;
    }
  }

  private async verifyToken(token: string): Promise<jwt.JwtPayload | string> {
    return new Promise((resolve, reject) => {
      jwt.verify(
        token,
        (header, callback) => this.getKey(header, callback),
        { algorithms: ['RS256'] },
        (err, decoded) => {
          if (err) {
            this.logger.error('토큰 검증 오류:', err.message);
            return reject(err);
          }
          this.logger.log('토큰 검증 완료');
          resolve(decoded);
        },
      );
    });
  }

  private getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) {
    this.client.getSigningKey(header.kid, (err, key) => {
      if (err) {
        this.logger.error(`키 가져오기 실패: ${err.message}`);
        return callback(err, null);
      }
      const signingKey = key.getPublicKey();
      this.logger.log(`키 가져오기 성공: kid=${header.kid}`);
      callback(null, signingKey);
    });
  }
}
