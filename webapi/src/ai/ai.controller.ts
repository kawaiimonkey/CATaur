import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiChatService } from './ai-chat.service';
import {
  AiChatCompletionsRequestDto,
  AiChatCompletionsResponseDto,
} from './dto/ai-chat-completions.dto';

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(private readonly aiChatService: AiChatService) {}

  @Post('chat/completions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create an AI chat completion (non-streaming)' })
  @ApiOkResponse({ type: AiChatCompletionsResponseDto })
  async createChatCompletion(
    @Body() dto: AiChatCompletionsRequestDto,
  ): Promise<AiChatCompletionsResponseDto> {
    return this.aiChatService.createChatCompletion(dto);
  }
}
