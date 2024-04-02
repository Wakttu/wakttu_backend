import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions } from 'socket.io';
import express from 'express';
export declare class SessionAdapter extends IoAdapter {
    private session;
    constructor(session: express.RequestHandler, app: INestApplicationContext);
    create(port: number, options?: ServerOptions): Server;
}
