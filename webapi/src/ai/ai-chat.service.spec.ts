import { BadRequestException } from '@nestjs/common';
import { AiChatService } from './ai-chat.service';

describe('AiChatService', () => {
  function createService(overrides: {
    getConfig?: any;
    getCustomProviders?: any;
    openai?: any;
    anthropic?: any;
    gemini?: any;
    ollama?: any;
  }) {
    const aiProviderConfigService: any = {
      getConfig: overrides.getConfig,
      getCustomProviders: overrides.getCustomProviders,
    };

    const openai: any = { createChatCompletion: overrides.openai };
    const anthropic: any = { createChatCompletion: overrides.anthropic };
    const gemini: any = { createChatCompletion: overrides.gemini };
    const ollama: any = { createChatCompletion: overrides.ollama };

    return new AiChatService(aiProviderConfigService, openai, anthropic, gemini, ollama);
  }

  it('rejects azure', async () => {
    const service = createService({
      getConfig: jest.fn(),
      getCustomProviders: jest.fn(),
      openai: jest.fn(),
      anthropic: jest.fn(),
      gemini: jest.fn(),
      ollama: jest.fn(),
    });

    await expect(
      service.createChatCompletion({
        provider: 'azure',
        model: 'anything',
        messages: [{ role: 'user', content: 'hi' }],
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('routes google -> gemini adapter', async () => {
    const service = createService({
      getConfig: jest.fn().mockResolvedValue({ apiKey: 'k', defaultModel: 'models/gemini-1.5-flash' }),
      getCustomProviders: jest.fn().mockResolvedValue([]),
      openai: jest.fn(),
      anthropic: jest.fn(),
      gemini: jest.fn().mockResolvedValue({ provider: 'google', model: 'm', outputText: 'ok' }),
      ollama: jest.fn(),
    });

    const result = await service.createChatCompletion({
      provider: 'google',
      messages: [{ role: 'user', content: 'hi' }],
    } as any);

    expect(result.outputText).toBe('ok');
  });

  it('routes custom provider based on providerType', async () => {
    const service = createService({
      getConfig: jest.fn().mockResolvedValue({ apiKey: 'k', defaultModel: 'gpt-4o-mini' }),
      getCustomProviders: jest.fn().mockResolvedValue([
        { id: 'local-ollama', label: 'Local', baseUrl: 'http://localhost:11434', providerType: 'ollama' },
      ]),
      openai: jest.fn(),
      anthropic: jest.fn(),
      gemini: jest.fn(),
      ollama: jest.fn().mockResolvedValue({ provider: 'local-ollama', model: 'm', outputText: 'ok' }),
    });

    const result = await service.createChatCompletion({
      provider: 'local-ollama',
      model: 'llama3',
      messages: [{ role: 'user', content: 'hi' }],
    } as any);

    expect(result.outputText).toBe('ok');
  });
});
