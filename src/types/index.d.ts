// eslint-disable-next-line @typescript-eslint/no-unused-vars
import session from 'express-session';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as express from 'express';

declare module 'express-session' {
  interface SessionData {
    auth: object;
    accessToken: string;
    refreshToken: string;
    user: any;
  }
}

declare global {
  namespace Express {
    interface User {
      custom?: any; // 원하는 타입으로 변경
    }
  }
}
