import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { AIProvider, AIProviderConfigDto, AIProviderResponseDto } from '../dto/ai-provider.dto';
import { Logger } from '@nestjs/common';
import { EncryptionService } from '../../common/encryption.service';

const AI_PROVIDER_CONFIG_PREFIX = 'ai_provider_config:';
const AI_PROVIDERS_LIST_KEY = 'ai_providers_list';

@Injectable()
export class AIProviderConfigService {
  private readonly logger = new Logger(AIProviderConfigService.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly encryptionService: EncryptionService,
  ) {}

  /**
   * Save or update AI provider configuration
   */
  async saveConfig(config: AIProviderConfigDto): Promise<AIProviderResponseDto> {
    try {
      const key = this.getConfigKey(config.provider);
      const responseDto: AIProviderResponseDto = {
        ...config,
        updatedAt: Date.now(),
      };

      // Save configuration to Redis
      const encryptedPayload = this.encryptionService.encryptJson(responseDto);
      await this.cacheManager.set(key, encryptedPayload, 0); // 0 means no expiration

      // Update provider list
      await this.updateProvidersList();

      this.logger.log(`AI Provider config saved: ${config.provider}`);
      return responseDto;
    } catch (error) {
      this.logger.error(`Failed to save AI Provider config: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get specific AI provider configuration
   */
  async getConfig(provider: AIProvider): Promise<AIProviderResponseDto | null> {
    try {
      const key = this.getConfigKey(provider);
      const configStr = await this.cacheManager.get<Buffer>(key);

      if (!configStr) {
        this.logger.warn(`AI Provider config not found: ${provider}`);
        return null;
      }

      return this.encryptionService.decryptJson<AIProviderResponseDto>(configStr);
    } catch (error) {
      this.logger.error(`Failed to get AI Provider config: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all AI provider configurations
   */
  async getAllConfigs(): Promise<AIProviderResponseDto[]> {
    try {
      const providers = Object.values(AIProvider);
      const configs: AIProviderResponseDto[] = [];

      for (const provider of providers) {
        const config = await this.getConfig(provider);
        if (config) {
          configs.push(config);
        }
      }

      return configs;
    } catch (error) {
      this.logger.error(`Failed to get all AI Provider configs: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete specific AI provider configuration
   */
  async deleteConfig(provider: AIProvider): Promise<void> {
    try {
      const key = this.getConfigKey(provider);
      await this.cacheManager.del(key);
      await this.updateProvidersList();
      this.logger.log(`AI Provider config deleted: ${provider}`);
    } catch (error) {
      this.logger.error(`Failed to delete AI Provider config: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if a provider configuration exists
   */
  async hasConfig(provider: AIProvider): Promise<boolean> {
    const config = await this.getConfig(provider);
    return config !== null;
  }

  /**
   * Get configuration key in Redis
   */
  private getConfigKey(provider: AIProvider): string {
    return `${AI_PROVIDER_CONFIG_PREFIX}${provider}`;
  }

  /**
   * Update provider list cache
   */
  private async updateProvidersList(): Promise<void> {
    try {
      const configs = await this.getAllConfigs();
      const providersList = configs.map((c) => c.provider);
      await this.cacheManager.set(
        AI_PROVIDERS_LIST_KEY,
        JSON.stringify(providersList),
        0,
      );
    } catch (error) {
      this.logger.warn(
        `Failed to update providers list: ${error.message}`,
      );
    }
  }
}
