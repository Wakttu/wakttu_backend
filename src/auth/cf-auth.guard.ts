import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import * as jwksClient from 'jwks-rsa';

@Injectable()
export class CloudflareGuard implements CanActivate {
  private client: jwksClient.JwksClient;

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
      console.error('JWT 없음: Authorization 헤더가 비어 있습니다.');
      return false;
    }

    try {
      const decoded = await this.verifyToken(token);
      // 검증 성공 시 사용자 정보를 요청 객체에 저장
      request.user = decoded;
      return true;
    } catch (error) {
      console.error('JWT 검증 실패:', error.message);
      return false;
    }
  }

  private async verifyToken(token: string): Promise<jwt.JwtPayload | string> {
    return new Promise((resolve, reject) => {
      jwt.verify(
        token,
        (header, callback) => this.getKey(header, callback),
        { algorithms: ['RS256'] }, // Cloudflare는 RS256 알고리즘 사용
        (err, decoded) => {
          if (err) {
            return reject(err);
          }
          resolve(decoded);
        },
      );
    });
  }

  private getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) {
    this.client.getSigningKey(header.kid, (err, key) => {
      if (err) {
        return callback(err, null);
      }
      const signingKey = key.getPublicKey();
      callback(null, signingKey);
    });
  }
}
