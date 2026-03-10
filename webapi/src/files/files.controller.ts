import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth, ApiOkResponse, ApiProperty } from '@nestjs/swagger';

class UploadParamsDto {
    @ApiProperty({ description: 'The filename used during signature generation' })
    filename: string;

    @ApiProperty({ description: 'The expiration timestamp' })
    expires: number;

    @ApiProperty({ description: 'The HMAC-SHA256 signature' })
    signature: string;
}

class UploadUrlResponseDto {
    @ApiProperty({ description: 'The endpoint to POST the file to' })
    uploadUrl: string;

    @ApiProperty({ description: 'Required signature parameters for the upload request', type: UploadParamsDto })
    params: UploadParamsDto;
}

@ApiTags('files')
@Controller('files')
export class FilesController {
    constructor(private readonly filesService: FilesService) { }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Get('upload-url')
    @ApiOperation({ summary: 'Request a signed upload URL from the external file service' })
    @ApiQuery({ name: 'filename', required: true, description: 'The name of the file to be uploaded' })
    @ApiOkResponse({ type: UploadUrlResponseDto })
    async getUploadUrl(@Query('filename') filename: string): Promise<UploadUrlResponseDto> {
        return this.filesService.getUploadUrl(filename);
    }
}
