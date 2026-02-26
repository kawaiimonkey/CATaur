import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class FilesService {
    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) { }

    async getUploadUrl(filename: string): Promise<any> {
        const baseUrl = this.configService.get<string>('FILE_SERVICE_URL');
        const key = this.configService.get<string>('FILE_SERVICE_KEY');

        const url = `${baseUrl}/files/request-upload`;

        const response = await firstValueFrom(
            this.httpService.get(url, {
                params: { filename, key },
            }),
        );

        return response.data;
    }
}
