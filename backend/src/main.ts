import { config as loadDotenv } from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

import { AppModule } from './app.module';
import { PrismaClientExceptionFilter } from './common/filters/prisma-client-exception.filter';
import { JsonSerializerInterceptor } from './common/interceptors/json-serializer.interceptor';

const envPath = join(process.cwd(), '.env');
if (existsSync(envPath)) {
  loadDotenv({ path: envPath });
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const uploadsPath = join(process.cwd(), 'uploads');
  const port = Number(process.env.PORT ?? process.env.API_PORT ?? 3001);

  if (!existsSync(uploadsPath)) {
    mkdirSync(uploadsPath, { recursive: true });
  }

  app.setGlobalPrefix('api');
  app.useStaticAssets(uploadsPath, { prefix: '/uploads/' });
  // Production deployments often proxy only `/api/*` to the backend. Expose uploads there too.
  app.useStaticAssets(uploadsPath, { prefix: '/api/uploads/' });
  app.enableCors({
    origin: (origin, callback) => {
      // Non-browser requests (curl, server-to-server) typically don't send Origin.
      if (!origin) {
        callback(null, true);
        return;
      }

      const allowedOrigins = new Set([
        'http://localhost:4321',
        'http://127.0.0.1:4321',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'https://climatrade.store',
        'https://www.climatrade.store',
      ]);

      if (allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS: origin ${origin} is not allowed`), false);
    },
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new PrismaClientExceptionFilter());
  app.useGlobalInterceptors(new JsonSerializerInterceptor());

  await app.listen(port);
}

bootstrap();
