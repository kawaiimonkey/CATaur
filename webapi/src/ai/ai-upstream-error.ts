import {
  BadGatewayException,
  BadRequestException,
  GatewayTimeoutException,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import axios, { AxiosError } from 'axios';

export function mapUpstreamError(error: unknown): never {
  if (!axios.isAxiosError(error)) {
    throw error;
  }

  const axiosError = error as AxiosError;

  if (axiosError.code === 'ECONNABORTED') {
    throw new GatewayTimeoutException('Upstream request timed out');
  }

  const status = axiosError.response?.status;

  if (status === 401 || status === 403) {
    throw new UnauthorizedException('Upstream provider rejected credentials');
  }

  if (status === 429) {
    throw new HttpException(
      'Upstream provider rate limited the request',
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }

  if (status && status >= 400 && status < 500) {
    throw new BadRequestException('Upstream provider rejected the request');
  }

  throw new BadGatewayException('Upstream provider request failed');
}
