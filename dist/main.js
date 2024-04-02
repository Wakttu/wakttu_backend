'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const core_1 = require('@nestjs/core');
const swagger_1 = require('@nestjs/swagger');
const app_module_1 = require('./app.module');
const common_1 = require('@nestjs/common');
const session_adapter_1 = require('./session.adapter');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session');
const redis_1 = require('redis');
const connect_redis_1 = require('connect-redis');
const prisma_filter_1 = require('./prisma.filter');
async function bootstrap() {
  const app = await core_1.NestFactory.create(app_module_1.AppModule);
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? ['https://wakttu.kr', 'https://www.wakttu.kr']
        : process.env.NODE_ENV === 'jogong'
          ? ['https://for-jogong.wakttu.kr']
          : ['http://localhost:3000'],
    credentials: true,
  });
  const redisClient = (0, redis_1.createClient)({
    url: `redis://${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || 6379}`,
    password: process.env.REDIS_PASSWORD || undefined,
    database: parseInt(process.env.REDIS_DB || '0', 10),
  });
  redisClient.on('error', (err) => console.error('Redis Client Error', err));
  await redisClient.connect().then();
  const MongoStore = MongoDBStore(session);
  const sessionMiddleware = session({
    store:
      process.env.NODE_ENV === 'development'
        ? new connect_redis_1.default({ client: redisClient })
        : new MongoStore({
            uri: process.env.SESSION_DB_URI,
            databaseName: process.env.SESSION_DB_NAME,
            collection: process.env.SESSION_DB_COLLECTION,
          }),
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 86400000 * 2,
      httpOnly:
        process.env.NODE_ENV === 'production' ||
        process.env.NODE_ENV === 'jogong',
    },
  });
  app.use(sessionMiddleware);
  app.useWebSocketAdapter(
    new session_adapter_1.SessionAdapter(sessionMiddleware, app),
  );
  const config = new swagger_1.DocumentBuilder()
    .setTitle('Wakttu')
    .setDescription('Wakttu API description')
    .setVersion('1.0.0')
    .addTag('swagger')
    .build();
  const document = swagger_1.SwaggerModule.createDocument(app, config);
  swagger_1.SwaggerModule.setup('api', app, document);
  app.useGlobalPipes(
    new common_1.ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new prisma_filter_1.PrismaClientExceptionFilter());
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
//# sourceMappingURL=main.js.map
