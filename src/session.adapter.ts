import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions } from 'socket.io';
import express from 'express';

export class SessionAdapter extends IoAdapter {
  private session: express.RequestHandler;

  constructor(session: express.RequestHandler, app: INestApplicationContext) {
    super(app);
    this.session = session;
  }

  create(port: number, options?: ServerOptions): Server {
    const server: Server = super.create(port, options);

    const wrap = (middleware) => (socket, next) =>
      middleware(socket.request, {}, next);

    server.use((socket, next) => {
      next();
    });
    server.use(wrap(this.session));

    return server;
  }
}
