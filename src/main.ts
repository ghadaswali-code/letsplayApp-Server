import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const origins = config.getOrThrow<string[]>('corsOrigins');

  app.setGlobalPrefix('api/v1');
  app.enableCors({ origin: origins, credentials: true });
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const documentConfig = new DocumentBuilder()
    .setTitle("LET'S PLAY Backend API")
    .setDescription(
      'MVP v1 gamification, family profiles, progress, and rewards API.',
    )
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, documentConfig);
  SwaggerModule.setup('docs', app, document);

  await app.listen(config.get<number>('PORT', 3000));
}

void bootstrap();
