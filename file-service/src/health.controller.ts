// src/health.controller.ts
import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import type { Response } from 'express';

@ApiTags('System Monitoring')
@Controller('health')
export class HealthController {
  constructor(private configService: ConfigService) {}

  @Get()
  @ApiOperation({ summary: 'Check storage service connection status' })
  async checkHealth(@Res() res: Response) {
    const filerUrl =
      this.configService.get<string>('SEAWEEDFS_FILER_URL') ||
      'http://filer:8888';

    // We can also derive the Master address from Filer (usually if Filer is normal, the whole system is normal)
    const results = {
      nestjs: 'OK',
      seaweedfs_filer: { status: 'Checking...', url: filerUrl },
      ssh_tunnel: 'Checking...',
    };

    try {
      // Attempt to access Filer's root directory or version info
      await axios.get(filerUrl, { timeout: 2000 });
      results.seaweedfs_filer.status = 'Connected';
      results.ssh_tunnel = 'Active (Local Debug Mode)';

      return res.status(HttpStatus.OK).json(results);
    } catch (error) {
      results.seaweedfs_filer.status = 'Disconnected';
      results.ssh_tunnel = 'Inactive or Server Down';

      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        ...results,
        error: error.message,
        tip: 'Please check if SSH tunnel is open: ssh -L 8888:127.0.0.1:8888 ...',
      });
    }
  }
}
