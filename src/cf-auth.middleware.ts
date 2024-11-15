import { Injectable, NestMiddleware } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as jwksClient from 'jwks-rsa';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CloudflareAuthMiddleware implements NestMiddleware {
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

  private getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) {
    this.client.getSigningKey(header.kid, (err, key) => {
      if (err) {
        return callback(err, null);
      }
      const signingKey = key.getPublicKey();
      callback(null, signingKey);
    });
  }

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: 'Unauthorized: No token provided' });
    }

    try {
      // JWT 검증
      jwt.verify(
        token,
        (header, callback) => this.getKey(header, callback),
        { algorithms: ['RS256'] }, // Cloudflare는 RS256 알고리즘 사용
        (err, decoded) => {
          if (err) {
            console.error('JWT 검증 실패:', err);
            return res
              .status(401)
              .json({ message: 'Unauthorized: Invalid token' });
          }

          // 검증 성공 시 사용자 정보를 요청 객체에 저장
          req.user = decoded;
          console.log(req.user, '------------------------', decoded);
          next();
        },
      );
    } catch (error) {
      console.error('Middleware Error:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
