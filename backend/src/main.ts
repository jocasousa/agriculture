import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true, 
    }),
  );

  // configura o Swagger
  const config = new DocumentBuilder()
    .setTitle('Agriculture API')
    .setDescription('CRUD Producers, Farms, Seasons, Cultivations e Dashboard')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    ignoreGlobalPrefix: false,
  });
  SwaggerModule.setup('api-docs', app, document);

  app.use(
    cors({
      origin: 'http://localhost:3000',
      'http://69.62.91.169:3000'
    }),
  );

  await app.listen(process.env.PORT ?? 3002);
}
bootstrap();
