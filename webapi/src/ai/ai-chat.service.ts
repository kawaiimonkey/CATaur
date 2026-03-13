import { BadRequestException, Injectable } from '@nestjs/common';
import { CustomAIProviderDto } from '../admin/dto/ai-provider.dto';
import { AIProviderConfigService } from '../admin/services/ai-provider-config.service';
import {
  AiChatCompletionsRequestDto,
  AiChatCompletionsResponseDto,
} from './dto/ai-chat-completions.dto';
import { AnthropicChatAdapter } from './adapters/anthropic-chat.adapter';
import { GeminiChatAdapter } from './adapters/gemini-chat.adapter';
import { OllamaChatAdapter } from './adapters/ollama-chat.adapter';
import { OpenAiChatAdapter } from './adapters/openai-chat.adapter';
import { mapUpstreamError } from './ai-upstream-error';

type AdapterType = 'openai' | 'anthropic' | 'gemini' | 'ollama';

@Injectable()
export class AiChatService {
  constructor(
    private readonly aiProviderConfigService: AIProviderConfigService,
    private readonly openAiAdapter: OpenAiChatAdapter,
    private readonly anthropicAdapter: AnthropicChatAdapter,
    private readonly geminiAdapter: GeminiChatAdapter,
    private readonly ollamaAdapter: OllamaChatAdapter,
  ) {}

  async createChatCompletion(
    dto: AiChatCompletionsRequestDto,
  ): Promise<AiChatCompletionsResponseDto> {
    const providerId = dto.provider.trim().toLowerCase();

    if (providerId === 'azure') {
      throw new BadRequestException('Azure chat is not supported');
    }

    const isBuiltin =
      providerId === 'openai' || providerId === 'anthropic' || providerId === 'google';

    if (!isBuiltin) {
      const matchesCustom = /^[a-z0-9][a-z0-9_-]{2,48}$/.test(providerId);
      if (!matchesCustom) {
        throw new BadRequestException('Invalid provider id');
      }
    }

    const customProviders = isBuiltin
      ? []
      : await this.aiProviderConfigService.getCustomProviders();
    const customEntry = isBuiltin
      ? null
      : (customProviders.find((p) => p.id === providerId) ?? null);

    if (!isBuiltin && !customEntry) {
      throw new BadRequestException('Unknown provider');
    }

    const config = await this.aiProviderConfigService.getConfig(providerId);
    if (!config) {
      throw new BadRequestException('Provider not configured');
    }

    const model = (dto.model?.trim() || config.defaultModel?.trim() || '').trim();
    if (!model) {
      throw new BadRequestException('Model required');
    }

    const resolved = this.resolveAdapter(providerId, customEntry);

    try {
      if (resolved.adapterType === 'openai') {
        return await this.openAiAdapter.createChatCompletion({
          provider: providerId,
          baseUrl: resolved.baseUrl,
          apiKey: config.apiKey,
          model,
          messages: dto.messages,
          temperature: dto.temperature,
          topP: dto.topP,
          maxTokens: dto.maxTokens,
          stop: dto.stop,
        });
      }

      if (resolved.adapterType === 'anthropic') {
        return await this.anthropicAdapter.createChatCompletion({
          provider: providerId,
          baseUrl: resolved.baseUrl,
          apiKey: config.apiKey,
          model,
          messages: dto.messages,
          temperature: dto.temperature,
          topP: dto.topP,
          maxTokens: dto.maxTokens,
          stop: dto.stop,
        });
      }

      if (resolved.adapterType === 'gemini') {
        return await this.geminiAdapter.createChatCompletion({
          provider: providerId,
          baseUrl: resolved.baseUrl,
          apiKey: config.apiKey,
          model,
          messages: dto.messages,
          temperature: dto.temperature,
          topP: dto.topP,
          maxTokens: dto.maxTokens,
          stop: dto.stop,
        });
      }

      if (!resolved.baseUrl) {
        throw new BadRequestException('Provider baseUrl is required for Ollama');
      }

      return await this.ollamaAdapter.createChatCompletion({
        provider: providerId,
        baseUrl: resolved.baseUrl,
        model,
        messages: dto.messages,
        temperature: dto.temperature,
        topP: dto.topP,
        maxTokens: dto.maxTokens,
        stop: dto.stop,
      });
    } catch (error) {
      mapUpstreamError(error);
    }
  }

  private resolveAdapter(
    providerId: string,
    customEntry: CustomAIProviderDto | null,
  ): { adapterType: AdapterType; baseUrl?: string } {
    if (providerId === 'google') {
      return { adapterType: 'gemini' };
    }

    if (providerId === 'openai') {
      return { adapterType: 'openai' };
    }

    if (providerId === 'anthropic') {
      return { adapterType: 'anthropic' };
    }

    if (!customEntry) {
      throw new BadRequestException('Unknown provider');
    }

    const baseUrl = customEntry.baseUrl.replace(/\/+$/, '');
    return {
      adapterType: customEntry.providerType,
      baseUrl,
    };
  }
}
