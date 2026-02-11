import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('files')
@Controller('files')
export class FilesController {
    constructor(private readonly filesService: FilesService) { }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Get('upload-url')
    @ApiOperation({ summary: 'Request a signed upload URL from the external file service' })
    @ApiQuery({ name: 'filename', required: true, description: 'The name of the file to be uploaded' })
    @ApiResponse({ status: 200, description: 'Directly returns the response from the external file service' })
    async getUploadUrl(@Query('filename') filename: string) {
        return this.filesService.getUploadUrl(filename);
    }
}
