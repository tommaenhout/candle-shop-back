import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Candle, CandleDocument } from '../schemas/candle.schema';
import { CreateCandleDto } from './dto/create-candle.dto';
import { UpdateCandleDto } from './dto/update-candle.dto';

@Injectable()
export class CandlesService {
  constructor(
    @InjectModel(Candle.name) private candleModel: Model<CandleDocument>,
  ) {}

  async create(createCandleDto: CreateCandleDto): Promise<Candle> {
    const createdCandle = new this.candleModel(createCandleDto);
    return createdCandle.save();
  }

  async findAll(): Promise<Candle[]> {
    return this.candleModel.find({ isActive: true }).exec();
  }

  async findOne(id: string): Promise<Candle> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid candle ID format');
    }
    const candle = await this.candleModel.findById(id).exec();
    if (!candle) {
      throw new NotFoundException('Candle not found');
    }
    return candle;
  }

  async findByScent(scent: string): Promise<Candle[]> {
    return this.candleModel
      .find({ scent: { $regex: scent, $options: 'i' }, isActive: true })
      .exec();
  }

  async update(
    id: string,
    updateCandleDto: UpdateCandleDto,
  ): Promise<Candle> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid candle ID format');
    }
    const candle = await this.candleModel
      .findByIdAndUpdate(id, updateCandleDto, { new: true })
      .exec();
    if (!candle) {
      throw new NotFoundException('Candle not found');
    }
    return candle;
  }

  async remove(id: string): Promise<Candle> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid candle ID format');
    }
    const candle = await this.candleModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .exec();
    if (!candle) {
      throw new NotFoundException('Candle not found');
    }
    return candle;
  }

  async updateStock(id: string, quantity: number): Promise<Candle> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid candle ID format');
    }
    if (typeof quantity !== 'number' || isNaN(quantity)) {
      throw new BadRequestException('Quantity must be a valid number');
    }
    
    // Get current candle to check stock before updating
    const currentCandle = await this.candleModel.findById(id).exec();
    if (!currentCandle) {
      throw new NotFoundException('Candle not found');
    }
    
    // Check if the operation would result in negative stock
    const newStock = currentCandle.stock + quantity;
    if (newStock < 0) {
      throw new BadRequestException(
        `Insufficient stock. Current stock: ${currentCandle.stock}, requested change: ${quantity}. Cannot reduce stock below zero.`
      );
    }
    
    const candle = await this.candleModel
      .findByIdAndUpdate(id, { $inc: { stock: quantity } }, { new: true })
      .exec();
    if (!candle) {
      throw new NotFoundException('Candle not found');
    }
    return candle;
  }
}
