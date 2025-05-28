import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Garante que todo body será validado antes de entrar no controller
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove props não-decoradas
      forbidNonWhitelisted: true, // retorna 400 se vier campo extra
      transform: true, // converte JSON em instância de DTO
    }),
  );

  // configura o Swagger
  const config = new DocumentBuilder()
    .setTitle('Agriculture API')
    .setDescription('CRUD Producers, Farms, Seasons, Cultivations e Dashboard')
    .setVersion('1.0')
    // .addBearerAuth()    // se tiver autenticação JWT
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    // auto-load todos modelos DTO/enums
    ignoreGlobalPrefix: false,
  });
  SwaggerModule.setup('api-docs', app, document);

  app.use(
    cors({
      origin: 'http://localhost:3000',
    }),
  );

  await app.listen(process.env.PORT ?? 3002);
}
bootstrap();
