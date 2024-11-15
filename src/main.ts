import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SessionAdapter } from './session.adapter';
import * as session from 'express-session';
import * as MongoDBStore from 'connect-mongodb-session';
import { PrismaClientExceptionFilter } from './prisma.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? ['https://wakttu.kr', 'https://www.wakttu.kr'] // production CORS
        : ['http://localhost:3000'], // development CORS
    credentials: true,
  });

  const MongoStore = MongoDBStore(session);

  const store = new MongoStore({
    uri: process.env.SESSION_DB_URI,
    databaseName: process.env.SESSION_DB_NAME,
    collection: process.env.SESSION_DB_COLLECTION,
  });

  const sessionMiddleware = session({
    secret: process.env.SECRET, // 세션을 암호화하기 위한 암호기 설정
    resave: false, // 모든 request마다 기존에 있던 session에 아무런 변경 사항이 없을 시에도 그 session을 다시 저장하는 옵션.
    saveUninitialized: false,
    cookie: {
      maxAge: 86400000 * 2,
      httpOnly: true,
    },
    store: store,
  });
  app.use(sessionMiddleware);
  app.useWebSocketAdapter(new SessionAdapter(sessionMiddleware, app));

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
