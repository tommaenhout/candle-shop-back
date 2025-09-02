import { PartialType } from '@nestjs/swagger';
import { CreateCandleDto } from './create-candle.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateCandleDto extends PartialType(CreateCandleDto) {
  @ApiProperty({
    description: 'Whether the candle is active/available for sale',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
