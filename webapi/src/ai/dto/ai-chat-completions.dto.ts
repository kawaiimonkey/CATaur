import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AiChatMessageDto {
  @ApiProperty({ enum: ['system', 'user', 'assistant'] })
  @IsIn(['system', 'user', 'assistant'])
  role: 'system' | 'user' | 'assistant';

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class AiChatCompletionsRequestDto {
  @ApiProperty({ description: 'Provider id (builtin or custom)' })
  @IsString()
  @IsNotEmpty()
  provider: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  model?: string;

  @ApiProperty({ type: [AiChatMessageDto] })
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => AiChatMessageDto)
  messages: AiChatMessageDto[];

  @ApiProperty({ required: false, minimum: 0, maximum: 2 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(2)
  temperature?: number;

  @ApiProperty({ required: false, minimum: 0, maximum: 1 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(1)
  topP?: number;

  @ApiProperty({ required: false, minimum: 1, maximum: 8192 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(8192)
  maxTokens?: number;

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  stop?: string[];
}

export class AiChatUsageDto {
  @ApiProperty({ required: false })
  inputTokens?: number;

  @ApiProperty({ required: false })
  outputTokens?: number;

  @ApiProperty({ required: false })
  totalTokens?: number;
}

export class AiChatCompletionsResponseDto {
  @ApiProperty()
  provider: string;

  @ApiProperty()
  model: string;

  @ApiProperty()
  outputText: string;

  @ApiProperty({ required: false })
  finishReason?: string;

  @ApiProperty({ required: false, type: AiChatUsageDto })
  usage?: AiChatUsageDto;
}
