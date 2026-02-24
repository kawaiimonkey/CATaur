import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FilesController } from './files.controller';
import { HealthController } from './health.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true,envFilePath:'.env'  })],
  controllers: [AppController, FilesController, HealthController],
  providers: [AppService],
})
export class AppModule {}
