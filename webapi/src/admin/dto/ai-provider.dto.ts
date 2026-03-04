import { IsEnum, IsString, IsNotEmpty } from 'class-validator';

export enum AIProvider {
  OPENAI = 'OpenAI',
  ANTHROPIC = 'Anthropic',
  AZURE_OPENAI = 'Azure OpenAI',
  GOOGLE = 'Google',
}

export class AIProviderConfigDto {
  @IsEnum(AIProvider)
  @IsNotEmpty()
  provider: AIProvider;

  @IsString()
  @IsNotEmpty()
  apiKey: string;

  @IsString()
  @IsNotEmpty()
  defaultModel: string;
}

export class AIProviderResponseDto {
  provider: AIProvider;
  apiKey: string;
  defaultModel: string;
  updatedAt: number;
}

export class AIProvidersListResponseDto {
  providers: AIProviderResponseDto[];
}
