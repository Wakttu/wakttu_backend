import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions, Socket } from 'socket.io';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import express from 'express';

interface ConnectionTracker {
  connections: Map<string, Set<string>>; // IP -> Set of socket IDs
  ipLimiter: RateLimiterMemory;
  globalLimiter: RateLimiterMemory;
  lastCleanup: number;
}

export class EnhancedSessionAdapter extends IoAdapter {
  private session: express.RequestHandler;
  private tracker: ConnectionTracker;
  private readonly MAX_CONNECTIONS_PER_IP = 5;
  private readonly MAX_GLOBAL_CONNECTIONS = 1;
  private readonly CLEANUP_INTERVAL = 60000; // 1분

  constructor(session: express.RequestHandler, app: INestApplicationContext) {
    super(app);
    this.session = session;
    this.initializeTracker();
  }

  private initializeTracker() {
    this.tracker = {
      connections: new Map(),
      ipLimiter: new RateLimiterMemory({
        points: 5, // 초당 연결 시도 횟수
        duration: 1, // 1초
        blockDuration: 60, // 차단 시간 60초
      }),
      globalLimiter: new RateLimiterMemory({
        points: 100, // 전역 초당 연결 시도 횟수
        duration: 1,
        blockDuration: 30,
      }),
      lastCleanup: Date.now(),
    };
  }

  create(port: number, options?: ServerOptions): Server {
    const server: Server = super.create(port, {
      ...options,
    });

    const wrap = (middleware) => (socket: Socket, next) =>
      middleware(socket.request, {}, next);

    server.use(wrap(this.session));

    // 연결 제한 미들웨어
    server.use(async (socket: Socket, next) => {
      try {
        await this.validateConnection(socket);
        await this.trackConnection(socket);
        this.setupDisconnectHandler(socket);
        next();
      } catch (error) {
        const errorMessage = this.getErrorMessage(error);
        next(new Error(errorMessage));
        socket.disconnect(true);
      }
    });

    // 주기적 정리 작업 설정
    setInterval(() => this.cleanup(), this.CLEANUP_INTERVAL);

    return server;
  }

  private async validateConnection(socket: Socket): Promise<void> {
    const ip = socket.handshake.address;

    // 1. 글로벌 rate limit 체크
    await this.tracker.globalLimiter.consume(ip);

    // 2. IP별 rate limit 체크
    await this.tracker.ipLimiter.consume(ip);

    // 3. IP별 동시 연결 수 체크
    const ipConnections = this.tracker.connections.get(ip)?.size || 0;
    if (ipConnections >= this.MAX_CONNECTIONS_PER_IP) {
      throw new Error('IP_LIMIT_EXCEEDED');
    }

    // 4. 전역 연결 수 체크
    let totalConnections = 0;
    this.tracker.connections.forEach((connections) => {
      totalConnections += connections.size;
    });

    if (totalConnections >= this.MAX_GLOBAL_CONNECTIONS) {
      throw new Error('GLOBAL_LIMIT_EXCEEDED');
    }
  }

  private async trackConnection(socket: Socket): Promise<void> {
    const ip = socket.handshake.address;

    if (!this.tracker.connections.has(ip)) {
      this.tracker.connections.set(ip, new Set());
    }

    this.tracker.connections.get(ip).add(socket.id);
  }

  private setupDisconnectHandler(socket: Socket): void {
    socket.on('disconnect', () => {
      const ip = socket.handshake.address;
      const connections = this.tracker.connections.get(ip);

      if (connections) {
        connections.delete(socket.id);
        if (connections.size === 0) {
          this.tracker.connections.delete(ip);
        }
      }
    });
  }

  private cleanup(): void {
    const now = Date.now();
    if (now - this.tracker.lastCleanup >= this.CLEANUP_INTERVAL) {
      this.tracker.lastCleanup = now;

      // 오래된 연결 정리
      this.tracker.connections.forEach((connections, ip) => {
        if (connections.size === 0) {
          this.tracker.connections.delete(ip);
        }
      });
    }
  }

  private getErrorMessage(error: Error): string {
    switch (error.message) {
      case 'IP_LIMIT_EXCEEDED':
        return '연결 제한을 초과했습니다. 잠시 후 다시 시도해주세요.';
      case 'GLOBAL_LIMIT_EXCEEDED':
        return '서버가 가득 찼습니다. 잠시 후 다시 시도해주세요.';
      default:
        return '연결 중 오류가 발생했습니다.';
    }
  }
}
