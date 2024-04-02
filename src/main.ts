import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as session from 'express-session';
import * as passport from 'passport';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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

  app.use(
    session({
      secret: process.env.SECRET, // 세션을 암호화하기 위한 암호기 설정
      resave: false, // 모든 request마다 기존에 있던 session에 아무런 변경 사항이 없을 시에도 그 session을 다시 저장하는 옵션
      // saveUnitialized: 초기화되지 않은 세션을 저장할지 여부를 나타낸다.
      saveUninitialized: false,
      // 세션 쿠키에 대한 설정을 나타낸다.
      cookie: {
        maxAge: 60000 * 60, // 1 hour
        httpOnly: true,
      },
    }),
  );
  // Passport를 초기화하는 미들웨어, 이를 통해 Passport의 인증/인가를 사용할 수 있다.
  app.use(passport.initialize());
  // Passport 세션을 사용하기 위한 미들웨어이다. 이를 통해 Passport는 세션을 기반으로 사용자의 인증 상태를 유지 관리 할 수 있다.
  app.use(passport.session());
  await app.listen(3000);
}
bootstrap();
