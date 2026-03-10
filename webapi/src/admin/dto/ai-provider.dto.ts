import { IsEnum, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum AIProvider {
  OPENAI = 'OpenAI',
  ANTHROPIC = 'Anthropic',
  AZURE_OPENAI = 'Azure OpenAI',
  GOOGLE = 'Google',
}

export class AIProviderConfigDto {
  @ApiProperty({ enum: AIProvider })
  @IsEnum(AIProvider)
  @IsNotEmpty()
  provider: AIProvider;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  apiKey: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  defaultModel: string;
}

export class AIProviderResponseDto {
  @ApiProperty({ enum: AIProvider })
  provider: AIProvider;

  @ApiProperty()
  apiKey: string;

  @ApiProperty()
  defaultModel: string;

  @ApiProperty()
  updatedAt: number;
}

export class AIProvidersListResponseDto {
  @ApiProperty({ type: [AIProviderResponseDto] })
  providers: AIProviderResponseDto[];
}
