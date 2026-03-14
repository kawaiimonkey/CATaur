import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { AiChatMessageDto, AiChatCompletionsResponseDto } from '../dto/ai-chat-completions.dto';

type OpenAiChatInput = {
  provider: string;
  baseUrl?: string;
  apiKey: string;
  model: string;
  messages: AiChatMessageDto[];
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  stop?: string[];
};

@Injectable()
export class OpenAiChatAdapter {
  private readonly timeoutMs = 90_000;

  async createChatCompletion(input: OpenAiChatInput): Promise<AiChatCompletionsResponseDto> {
    const baseUrl = (input.baseUrl || 'https://api.openai.com').replace(/\/+$/, '');

    const response = await axios.post<{
      choices: Array<{
        message: { role: string; content: string };
        finish_reason?: string;
      }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
      model: string;
    }>(
      `${baseUrl}/v1/chat/completions`,
      {
        model: input.model,
        messages: input.messages.map((m) => ({ role: m.role, content: m.content })),
        temperature: input.temperature,
        top_p: input.topP,
        max_tokens: input.maxTokens,
        stop: input.stop,
      },
      {
        headers: {
          Authorization: `Bearer ${input.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: this.timeoutMs,
      },
    );

    const choice = response.data.choices?.[0];
    const outputText = choice?.message?.content ?? '';

    return {
      provider: input.provider,
      model: response.data.model || input.model,
      outputText,
      finishReason: choice?.finish_reason,
      usage: response.data.usage
        ? {
            inputTokens: response.data.usage.prompt_tokens,
            outputTokens: response.data.usage.completion_tokens,
            totalTokens: response.data.usage.total_tokens,
          }
        : undefined,
    };
  }
}
