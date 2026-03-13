import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { AiChatMessageDto, AiChatCompletionsResponseDto } from '../dto/ai-chat-completions.dto';

type AnthropicChatInput = {
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
export class AnthropicChatAdapter {
  private readonly timeoutMs = 90_000;

  async createChatCompletion(input: AnthropicChatInput): Promise<AiChatCompletionsResponseDto> {
    const baseUrl = (input.baseUrl || 'https://api.anthropic.com').replace(/\/+$/, '');

    const system = input.messages
      .filter((m) => m.role === 'system')
      .map((m) => m.content)
      .join('\n');

    const messages = input.messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role,
        content: [{ type: 'text', text: m.content }],
      }));

    const response = await axios.post<{
      id: string;
      model: string;
      stop_reason?: string;
      usage?: { input_tokens?: number; output_tokens?: number };
      content: Array<{ type: string; text?: string }>;
    }>(
      `${baseUrl}/v1/messages`,
      {
        model: input.model,
        system: system || undefined,
        messages,
        max_tokens: input.maxTokens ?? 1024,
        temperature: input.temperature,
        top_p: input.topP,
        stop_sequences: input.stop,
      },
      {
        headers: {
          'x-api-key': input.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        timeout: this.timeoutMs,
      },
    );

    const outputText = (response.data.content || [])
      .filter((p) => p.type === 'text' && typeof p.text === 'string')
      .map((p) => p.text)
      .join('');

    return {
      provider: input.provider,
      model: response.data.model || input.model,
      outputText,
      finishReason: response.data.stop_reason,
      usage: response.data.usage
        ? {
            inputTokens: response.data.usage.input_tokens,
            outputTokens: response.data.usage.output_tokens,
            totalTokens:
              typeof response.data.usage.input_tokens === 'number' &&
              typeof response.data.usage.output_tokens === 'number'
                ? response.data.usage.input_tokens + response.data.usage.output_tokens
                : undefined,
          }
        : undefined,
    };
  }
}
