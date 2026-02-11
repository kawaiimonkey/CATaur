import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';

@Module({
    imports: [HttpModule],
    controllers: [FilesController],
    providers: [FilesService],
})
export class FilesModule { }
