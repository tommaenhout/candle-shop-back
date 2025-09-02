import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray, IsEnum, Min } from 'class-validator';

export class CreateCandleDto {
  @ApiProperty({
    description: 'The name of the candle',
    example: 'Vanilla Dream',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Detailed description of the candle',
    example: 'A luxurious vanilla-scented candle that fills your room with warmth and comfort',
    minLength: 1,
    maxLength: 500,
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Price of the candle in USD',
    example: 25.99,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Number of candles in stock',
    example: 10,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({
    description: 'Primary scent of the candle',
    example: 'vanilla',
  })
  @IsString()
  scent: string;

  @ApiProperty({
    description: 'Size of the candle',
    example: 'medium',
    enum: ['small', 'medium', 'large'],
  })
  @IsEnum(['small', 'medium', 'large'])
  size: 'small' | 'medium' | 'large';

  @ApiProperty({
    description: 'Tags associated with the candle',
    example: ['sweet', 'relaxing', 'home'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
