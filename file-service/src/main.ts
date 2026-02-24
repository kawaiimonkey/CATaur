import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
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


  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const config = new DocumentBuilder()
    .setTitle('CATaur File Service API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();
