import { Controller, Post, Get, Param, UseInterceptors, UploadedFile, Res, HttpStatus, HttpException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiBody, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import sharp from 'sharp';
import axios from 'axios';
import FormData from 'form-data';
import type { Response } from 'express';
import 'multer';

@ApiTags('Files')
@Controller('files')
export class FilesController {
    private filerUrl: string;

    constructor(private config = new ConfigService()) {
        this.filerUrl = this.config.get('SEAWEEDFS_FILER_URL') || 'http://filer:8888';
    }

    @Post('upload')
    @ApiConsumes('multipart/form-data')
    @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
    @UseInterceptors(FileInterceptor('file'))
    async upload(@UploadedFile() file: Express.Multer.File) {
        if (!file) throw new HttpException('No file', 400);

        let buffer = file.buffer;
        let finalName = `${Date.now()}-${file.originalname}`;

        // 图片处理：如果是图片则压缩并转为 jpg
        if (file.mimetype.startsWith('image/')) {
            buffer = await sharp(file.buffer).resize(1200, null, { withoutEnlargement: true }).jpeg({ quality: 80 }).toBuffer();
            finalName = finalName.replace(/\.[^/.]+$/, "") + ".jpg";
        }

        const form = new FormData();
        form.append('file', buffer, { filename: finalName });

        try {
            await axios.post(`${this.filerUrl}/uploads/${finalName}`, form, { headers: form.getHeaders() });
            return { url: `/files/view/${finalName}`, mimetype: file.mimetype };
        } catch (e) {
            throw new HttpException('SeaweedFS Upload Error', 500);
        }
    }

    @Get('view/:name')
    async view(@Param('name') name: string, @Res() res: Response) {
        try {
            const stream = await axios({ url: `${this.filerUrl}/uploads/${name}`, method: 'GET', responseType: 'stream' });
            res.setHeader('Content-Type', stream.headers['content-type']);
            stream.data.pipe(res);
        } catch (e) {
            res.status(404).send('Not Found');
        }
    }
}