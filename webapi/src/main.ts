import 'source-map-support/register';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as fs from 'fs';

async function bootstrap() {
  console.log(`NODE_ENV=${process.env.NODE_ENV ?? 'undefined'}`);
  
  // 调试：检查 .env 文件是否存在
  const envFile = process.env.NODE_ENV === 'production' ? '.env.nest.prod' : '.env.nest';
  console.log(`Looking for env file: ${envFile}`);
  console.log(`Env file exists: ${fs.existsSync(envFile)}`);
  if (fs.existsSync(envFile)) {
    console.log(`Env file content (first 200 chars): ${fs.readFileSync(envFile, 'utf8').substring(0, 200)}`);
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
  app.useStaticAssets(join(__dirname, '..', 'public'));

  app.useLogger(app.get(Logger));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.set('trust proxy', 1);
  app.enableCors();

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const config = new DocumentBuilder()
    .setTitle('CATaur API')
    .setDescription('The CATaur API description')
    .setVersion('1.0')
    .addTag('CATaur')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
