import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { AiChatMessageDto, AiChatCompletionsResponseDto } from '../dto/ai-chat-completions.dto';

type OllamaChatInput = {
  provider: string;
  baseUrl: string;
  model: string;
  messages: AiChatMessageDto[];
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  stop?: string[];
};

@Injectable()
export class OllamaChatAdapter {
  private readonly timeoutMs = 90_000;

  async createChatCompletion(input: OllamaChatInput): Promise<AiChatCompletionsResponseDto> {
    const baseUrl = input.baseUrl.replace(/\/+$/, '');

    const response = await axios.post<{
      message?: { role?: string; content?: string };
      done_reason?: string;
      prompt_eval_count?: number;
      eval_count?: number;
    }>(
      `${baseUrl}/api/chat`,
      {
        model: input.model,
        messages: input.messages.map((m) => ({ role: m.role, content: m.content })),
        stream: false,
        options: {
          temperature: input.temperature,
          top_p: input.topP,
          num_predict: input.maxTokens,
          stop: input.stop,
        },
      },
      {
        timeout: this.timeoutMs,
        headers: { 'Content-Type': 'application/json' },
      },
    );

    return {
      provider: input.provider,
      model: input.model,
      outputText: response.data.message?.content ?? '',
      finishReason: response.data.done_reason,
      usage:
        typeof response.data.prompt_eval_count === 'number' || typeof response.data.eval_count === 'number'
          ? {
              inputTokens: response.data.prompt_eval_count,
              outputTokens: response.data.eval_count,
              totalTokens:
                typeof response.data.prompt_eval_count === 'number' && typeof response.data.eval_count === 'number'
                  ? response.data.prompt_eval_count + response.data.eval_count
                  : undefined,
            }
          : undefined,
    };
  }
}
