import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuração global de validação
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Configuração CORS
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:19006'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Configuração Swagger
  const config = new DocumentBuilder()
    .setTitle('Finance App API')
    .setDescription('API para gerenciamento financeiro pessoal')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Autenticação')
    .addTag('Usuários')
    .addTag('Contas')
    .addTag('Cartões')
    .addTag('Categorias')
    .addTag('Transações')
    .addTag('Dashboard')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);

  await app.listen(port);
  console.log(`🚀 Aplicação rodando em: http://localhost:${port}`);
  console.log(`📚 Documentação Swagger: http://localhost:${port}/api`);
}

bootstrap();
