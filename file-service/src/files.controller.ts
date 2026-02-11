import {
    Controller,
    Post,
    Get,
    Param,
    UseInterceptors,
    UploadedFile,
    Res,
    HttpStatus,
    HttpException,
} from '@nestjs/common';
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

    constructor(private config: ConfigService) {
        this.filerUrl =
            this.config.get('SEAWEEDFS_FILER_URL') || 'http://filer:8888';
    }

    @Post('upload')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: { file: { type: 'string', format: 'binary' } },
        },
    })
    @UseInterceptors(FileInterceptor('file'))
    async upload(@UploadedFile() file?: Express.Multer.File) {
        if (!file) throw new HttpException('No file', 400);

        let buffer = file.buffer;
        let originalNameWithoutExt = file.originalname.replace(/\.[^/.]+$/, '');
        let finalName = `${Date.now()}-${originalNameWithoutExt}`;

        if (file.mimetype.startsWith('image/')) {
            buffer = await sharp(file.buffer)
                // 如果不想缩小图片，去掉 resize
                // .resize({ width: 1200, withoutEnlargement: true, kernel: sharp.kernel.lanczos3 })
                .avif({
                    quality: 85,      // 控制体积与视觉效果
                    effort: 4,        // 压缩速度/质量平衡，0-9
                    chromaSubsampling: '4:4:4' // 保留色彩精度，对风景图更清晰
                })
                .toBuffer();


            finalName += '.avif';
        } else {
            finalName = `${Date.now()}-${file.originalname}`; // 非图片保持原样
        }

        const form = new FormData();
        form.append('file', buffer, { filename: finalName });

        try {
            await axios.post(`${this.filerUrl}/uploads/${finalName}`, form, {
                headers: form.getHeaders(),
            });
            return {
                url: `/files/view/${finalName}`,
                mimetype: file.mimetype.startsWith('image/') ? 'image/avif' : file.mimetype
            };
        } catch (e) {
            throw new HttpException('SeaweedFS Upload Error', 500);
        }
    }

    @Get('view/:name')
    async view(@Param('name') name: string, @Res() res: Response) {
        try {
            const stream = await axios({
                url: `${this.filerUrl}/uploads/${name}`,
                method: 'GET',
                responseType: 'stream',
            });
            res.setHeader('Content-Type', stream.headers['content-type']);
            stream.data.pipe(res);
        } catch (e) {
            res.status(404).send('Not Found');
        }
    }
}
