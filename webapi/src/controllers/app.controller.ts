import { Controller, Get } from '@nestjs/common';
import { AppService } from '../services/app.service';
import { ApiTags, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

@ApiTags('')
@Controller()
export class AppController {
    constructor(private readonly appService: AppService) { }

    @Get()
    @ApiOperation({ summary: 'Get service status' })
    @ApiOkResponse({ schema: { type: 'string' } })
    getHello(): string {
        return this.appService.getHello();
    }

}
