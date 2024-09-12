import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestjsRedoxModule } from 'nestjs-redox';

import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import secureSession from '@fastify/secure-session';

import { AppModule } from './app.module';
import { version } from '../package.json';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  if (process.env.ENABLE_SWAGGER !== '0') {
    const config = new DocumentBuilder()
      .setTitle('Wakttu')
      .setDescription('Wakttu API description')
      .setVersion(version)
      .build();

    const document = SwaggerModule.createDocument(app, config);

    await SwaggerModule.setup('docs', app, document);
    await NestjsRedoxModule.setup('redoc', app, document);
  }

  if (process.env.NODE_ENV === 'development') {
    app.enableCors({
      origin: ['http://localhost:3000'],
      credentials: true,
    });
  } else {
    app.enableCors({
      origin: ['https://wakttu.kr', 'https://www.wakttu.kr'],
      credentials: true,
    });
  }

  await app.register(secureSession, {
    secret: process.env.SESSION_SECRET,
    salt: process.env.SESSION_SALT,
    cookie: {
      maxAge: 60000 * 60, // 1 hour
      httpOnly: true,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    await app.listen(3000);
  } else {
    await app.listen(3000, '0.0.0.0');
  }
}
bootstrap();
