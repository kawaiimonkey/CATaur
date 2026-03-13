import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { AiChatMessageDto, AiChatCompletionsResponseDto } from '../dto/ai-chat-completions.dto';

type GeminiChatInput = {
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
export class GeminiChatAdapter {
  private readonly timeoutMs = 90_000;

  async createChatCompletion(input: GeminiChatInput): Promise<AiChatCompletionsResponseDto> {
    const baseUrl = (input.baseUrl || 'https://generativelanguage.googleapis.com').replace(/\/+$/, '');

    const systemText = input.messages
      .filter((m) => m.role === 'system')
      .map((m) => m.content)
      .join('\n');

    const contents = input.messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    const modelPath = input.model.includes('/') ? input.model : `models/${input.model}`;

    const response = await axios.post<{
      candidates?: Array<{
        finishReason?: string;
        content?: { parts?: Array<{ text?: string }> };
      }>;
      usageMetadata?: {
        promptTokenCount?: number;
        candidatesTokenCount?: number;
        totalTokenCount?: number;
      };
    }>(
      `${baseUrl}/v1beta/${modelPath}:generateContent?key=${encodeURIComponent(input.apiKey)}`,
      {
        contents,
        systemInstruction: systemText ? { parts: [{ text: systemText }] } : undefined,
        generationConfig: {
          temperature: input.temperature,
          topP: input.topP,
          maxOutputTokens: input.maxTokens,
          stopSequences: input.stop,
        },
      },
      {
        timeout: this.timeoutMs,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    const candidate = response.data.candidates?.[0];
    const outputText = (candidate?.content?.parts || [])
      .map((p) => p.text || '')
      .join('');

    return {
      provider: input.provider,
      model: input.model,
      outputText,
      finishReason: candidate?.finishReason,
      usage: response.data.usageMetadata
        ? {
            inputTokens: response.data.usageMetadata.promptTokenCount,
            outputTokens: response.data.usageMetadata.candidatesTokenCount,
            totalTokens: response.data.usageMetadata.totalTokenCount,
          }
        : undefined,
    };
  }
}
