import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class UpdateStockDto {
  @ApiProperty({
    description: 'Quantity to add or subtract from current stock (use negative numbers to decrease)',
    example: 5,
    type: 'number',
  })
  @IsNumber()
  quantity: number;
}
