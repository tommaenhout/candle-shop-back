import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { CandlesService } from './candles.service';
import { CreateCandleDto } from './dto/create-candle.dto';
import { UpdateCandleDto } from './dto/update-candle.dto';

@ApiTags('candles')
@Controller('candles')
export class CandlesController {
  constructor(private readonly candlesService: CandlesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new candle',
    description: 'Creates a new candle with the provided details',
  })
  @ApiResponse({
    status: 201,
    description: 'The candle has been successfully created',
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        name: 'Vanilla Dream',
        description: 'A luxurious vanilla-scented candle',
        price: 25.99,
        stock: 10,
        scent: 'vanilla',
        size: 'medium',
        isActive: true,
        tags: ['sweet', 'relaxing'],
        createdAt: '2023-12-01T10:00:00.000Z',
        updatedAt: '2023-12-01T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  create(@Body() createCandleDto: CreateCandleDto) {
    return this.candlesService.create(createCandleDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all candles',
    description: 'Retrieves all active candles, optionally filtered by scent',
  })
  @ApiQuery({
    name: 'scent',
    required: false,
    description: 'Filter candles by scent (case-insensitive)',
    example: 'vanilla',
  })
  @ApiResponse({
    status: 200,
    description: 'List of candles retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        example: {
          _id: '507f1f77bcf86cd799439011',
          name: 'Vanilla Dream',
          description: 'A luxurious vanilla-scented candle',
          price: 25.99,
          stock: 10,
          scent: 'vanilla',
          size: 'medium',
          isActive: true,
          tags: ['sweet', 'relaxing'],
          createdAt: '2023-12-01T10:00:00.000Z',
          updatedAt: '2023-12-01T10:00:00.000Z',
        },
      },
    },
  })
  findAll(@Query('scent') scent?: string) {
    if (scent) {
      return this.candlesService.findByScent(scent);
    }
    return this.candlesService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a candle by ID',
    description: 'Retrieves a specific candle by its unique identifier',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the candle',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Candle found and returned successfully',
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        name: 'Vanilla Dream',
        description: 'A luxurious vanilla-scented candle',
        price: 25.99,
        stock: 10,
        scent: 'vanilla',
        size: 'medium',
        isActive: true,
        tags: ['sweet', 'relaxing'],
        createdAt: '2023-12-01T10:00:00.000Z',
        updatedAt: '2023-12-01T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Candle not found',
  })
  findOne(@Param('id') id: string) {
    return this.candlesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a candle',
    description: 'Updates an existing candle with new information',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the candle to update',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Candle updated successfully',
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        name: 'Updated Vanilla Dream',
        description: 'An updated luxurious vanilla-scented candle',
        price: 27.99,
        stock: 15,
        scent: 'vanilla',
        size: 'large',
        isActive: true,
        tags: ['sweet', 'relaxing', 'premium'],
        createdAt: '2023-12-01T10:00:00.000Z',
        updatedAt: '2023-12-01T11:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Candle not found',
  })
  update(@Param('id') id: string, @Body() updateCandleDto: UpdateCandleDto) {
    return this.candlesService.update(id, updateCandleDto);
  }

  @Patch(':id/stock')
  @ApiOperation({
    summary: 'Update candle stock',
    description: 'Adjusts the stock quantity of a candle (add or subtract)',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the candle',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    description: 'Stock adjustment details',
    schema: {
      type: 'object',
      properties: {
        quantity: {
          type: 'number',
          description: 'Quantity to add (positive) or subtract (negative)',
          example: 5,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Stock updated successfully',
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        name: 'Vanilla Dream',
        description: 'A luxurious vanilla-scented candle',
        price: 25.99,
        stock: 15,
        scent: 'vanilla',
        size: 'medium',
        isActive: true,
        tags: ['sweet', 'relaxing'],
        createdAt: '2023-12-01T10:00:00.000Z',
        updatedAt: '2023-12-01T11:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Candle not found',
  })
  updateStock(@Param('id') id: string, @Body('quantity') quantity: number) {
    return this.candlesService.updateStock(id, quantity);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a candle',
    description: 'Soft deletes a candle by setting isActive to false',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the candle to delete',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Candle deleted successfully (soft delete)',
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        name: 'Vanilla Dream',
        description: 'A luxurious vanilla-scented candle',
        price: 25.99,
        stock: 10,
        scent: 'vanilla',
        size: 'medium',
        isActive: false,
        tags: ['sweet', 'relaxing'],
        createdAt: '2023-12-01T10:00:00.000Z',
        updatedAt: '2023-12-01T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Candle not found',
  })
  remove(@Param('id') id: string) {
    return this.candlesService.remove(id);
  }
}
