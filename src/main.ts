import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { EnhancedSessionAdapter } from './session.adapter';
import * as session from 'express-session';
import * as MongoDBStore from 'connect-mongodb-session';

import { createClient } from 'redis';
import RedisStore from 'connect-redis';
import { PrismaClientExceptionFilter } from './prisma.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? ['https://wakttu.kr', 'https://www.wakttu.kr'] // production CORS
        : process.env.NODE_ENV === 'jogong'
          ? ['https://for-jogong.wakttu.kr'] // jogong CORS
          : ['http://localhost:3000'], // development CORS
    credentials: true,
  });

  const redisClient = createClient({
    url: `redis://${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || 6379}`,
    password: process.env.REDIS_PASSWORD || undefined,
    database: parseInt(process.env.REDIS_DB || '0', 10), // 문자열을 숫자로 변환
  });

  if (process.env.NODE_ENV !== 'development') {
    redisClient.on('error', (err) => console.error('Redis Client Error', err));
    await redisClient.connect(); // Redis v4에서는 connect()를 호출해야 합니다.
  }

  const MongoStore = MongoDBStore(session);

  const sessionMiddleware = session({
    store:
      process.env.NODE_ENV !== 'development'
        ? new RedisStore({ client: redisClient })
        : new MongoStore({
            uri: process.env.SESSION_DB_URI,
            databaseName: process.env.SESSION_DB_NAME,
            collection: process.env.SESSION_DB_COLLECTION,
          }),
    secret: process.env.SECRET, // 세션 암호화 키
    resave: false, // 세션이 변경되지 않으면 저장하지 않음
    saveUninitialized: false, // 초기화되지 않은 세션 저장 안 함
    cookie: {
      maxAge: 86400000 * 2, // 2일
      httpOnly:
        process.env.NODE_ENV === 'production' ||
        process.env.NODE_ENV === 'jogong', // HTTP 전용 쿠키 (XSS 방지)
    },
  });

  app.use(sessionMiddleware);
  app.useWebSocketAdapter(new EnhancedSessionAdapter(sessionMiddleware, app));

  const config = new DocumentBuilder()
    .setTitle('Wakttu')
    .setDescription('Wakttu API description')
    .setVersion('1.0.0')
    .addTag('swagger')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new PrismaClientExceptionFilter());

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
