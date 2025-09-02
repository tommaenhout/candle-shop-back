import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CandlesService } from './candles.service';
import { Candle, CandleDocument } from '../schemas/candle.schema';
import { CreateCandleDto } from './dto/create-candle.dto';
import { UpdateCandleDto } from './dto/update-candle.dto';

describe('CandlesService', () => {
  let service: CandlesService;
  let model: Model<CandleDocument>;

  const mockCandle = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test Candle',
    description: 'A test candle',
    price: 25.99,
    stock: 10,
    scent: 'vanilla',
    size: 'medium',
    isActive: true,
    tags: ['sweet', 'relaxing'],
    createdAt: new Date(),
    updatedAt: new Date(),
    save: jest.fn().mockResolvedValue(this),
  };

  const mockCandleModel = {
    new: jest.fn().mockResolvedValue(mockCandle),
    constructor: jest.fn().mockResolvedValue(mockCandle),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CandlesService,
        {
          provide: getModelToken(Candle.name),
          useValue: mockCandleModel,
        },
      ],
    }).compile();

    service = module.get<CandlesService>(CandlesService);
    model = module.get<Model<CandleDocument>>(getModelToken(Candle.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new candle', async () => {
      const createCandleDto: CreateCandleDto = {
        name: 'Test Candle',
        description: 'A test candle',
        price: 25.99,
        scent: 'vanilla',
        size: 'medium' as const,
        stock: 10,
        tags: ['sweet', 'relaxing'],
      };

      const saveSpy = jest.fn().mockResolvedValue(mockCandle);
      const constructorSpy = jest.fn().mockImplementation(() => ({
        save: saveSpy,
      }));

      (model as any) = constructorSpy;
      service = new CandlesService(model);

      const result = await service.create(createCandleDto);

      expect(constructorSpy).toHaveBeenCalledWith(createCandleDto);
      expect(saveSpy).toHaveBeenCalled();
      expect(result).toEqual(mockCandle);
    });
  });

  describe('findAll', () => {
    it('should return all active candles', async () => {
      const candles = [mockCandle, { ...mockCandle, _id: '507f1f77bcf86cd799439012' }];
      
      mockCandleModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(candles),
      });

      const result = await service.findAll();

      expect(mockCandleModel.find).toHaveBeenCalledWith({ isActive: true });
      expect(result).toEqual(candles);
    });
  });

  describe('findOne', () => {
    it('should return a candle by id', async () => {
      const candleId = '507f1f77bcf86cd799439011';
      
      mockCandleModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCandle),
      });

      const result = await service.findOne(candleId);

      expect(mockCandleModel.findById).toHaveBeenCalledWith(candleId);
      expect(result).toEqual(mockCandle);
    });

    it('should throw BadRequestException for invalid ObjectId', async () => {
      const invalidId = 'invalid-id';

      await expect(service.findOne(invalidId)).rejects.toThrow(BadRequestException);
      await expect(service.findOne(invalidId)).rejects.toThrow('Invalid candle ID format');
    });

    it('should throw NotFoundException when candle not found', async () => {
      const candleId = '507f1f77bcf86cd799439011';
      
      mockCandleModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne(candleId)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(candleId)).rejects.toThrow('Candle not found');
    });
  });

  describe('findByScent', () => {
    it('should return candles filtered by scent', async () => {
      const scent = 'vanilla';
      const candles = [mockCandle];
      
      mockCandleModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(candles),
      });

      const result = await service.findByScent(scent);

      expect(mockCandleModel.find).toHaveBeenCalledWith({
        scent: { $regex: scent, $options: 'i' },
        isActive: true,
      });
      expect(result).toEqual(candles);
    });
  });

  describe('update', () => {
    it('should update a candle', async () => {
      const candleId = '507f1f77bcf86cd799439011';
      const updateCandleDto: UpdateCandleDto = {
        name: 'Updated Candle',
        price: 29.99,
      };
      const updatedCandle = { ...mockCandle, ...updateCandleDto };

      mockCandleModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedCandle),
      });

      const result = await service.update(candleId, updateCandleDto);

      expect(mockCandleModel.findByIdAndUpdate).toHaveBeenCalledWith(
        candleId,
        updateCandleDto,
        { new: true }
      );
      expect(result).toEqual(updatedCandle);
    });

    it('should throw BadRequestException for invalid ObjectId', async () => {
      const invalidId = 'invalid-id';
      const updateCandleDto: UpdateCandleDto = { name: 'Updated' };

      await expect(service.update(invalidId, updateCandleDto)).rejects.toThrow(BadRequestException);
      await expect(service.update(invalidId, updateCandleDto)).rejects.toThrow('Invalid candle ID format');
    });

    it('should throw NotFoundException when candle not found', async () => {
      const candleId = '507f1f77bcf86cd799439011';
      const updateCandleDto: UpdateCandleDto = { name: 'Updated' };

      mockCandleModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.update(candleId, updateCandleDto)).rejects.toThrow(NotFoundException);
      await expect(service.update(candleId, updateCandleDto)).rejects.toThrow('Candle not found');
    });
  });

  describe('remove', () => {
    it('should soft delete a candle', async () => {
      const candleId = '507f1f77bcf86cd799439011';
      const deletedCandle = { ...mockCandle, isActive: false };

      mockCandleModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(deletedCandle),
      });

      const result = await service.remove(candleId);

      expect(mockCandleModel.findByIdAndUpdate).toHaveBeenCalledWith(
        candleId,
        { isActive: false },
        { new: true }
      );
      expect(result).toEqual(deletedCandle);
    });

    it('should throw BadRequestException for invalid ObjectId', async () => {
      const invalidId = 'invalid-id';

      await expect(service.remove(invalidId)).rejects.toThrow(BadRequestException);
      await expect(service.remove(invalidId)).rejects.toThrow('Invalid candle ID format');
    });

    it('should throw NotFoundException when candle not found', async () => {
      const candleId = '507f1f77bcf86cd799439011';

      mockCandleModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove(candleId)).rejects.toThrow(NotFoundException);
      await expect(service.remove(candleId)).rejects.toThrow('Candle not found');
    });
  });

  describe('updateStock', () => {
    it('should increase stock', async () => {
      const candleId = '507f1f77bcf86cd799439011';
      const quantity = 5;
      const updatedCandle = { ...mockCandle, stock: mockCandle.stock + quantity };

      mockCandleModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCandle),
      });
      mockCandleModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedCandle),
      });

      const result = await service.updateStock(candleId, quantity);

      expect(mockCandleModel.findById).toHaveBeenCalledWith(candleId);
      expect(mockCandleModel.findByIdAndUpdate).toHaveBeenCalledWith(
        candleId,
        { $inc: { stock: quantity } },
        { new: true }
      );
      expect(result).toEqual(updatedCandle);
    });

    it('should decrease stock when sufficient stock available', async () => {
      const candleId = '507f1f77bcf86cd799439011';
      const quantity = -3;
      const updatedCandle = { ...mockCandle, stock: mockCandle.stock + quantity };

      mockCandleModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCandle),
      });
      mockCandleModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedCandle),
      });

      const result = await service.updateStock(candleId, quantity);

      expect(mockCandleModel.findById).toHaveBeenCalledWith(candleId);
      expect(mockCandleModel.findByIdAndUpdate).toHaveBeenCalledWith(
        candleId,
        { $inc: { stock: quantity } },
        { new: true }
      );
      expect(result).toEqual(updatedCandle);
    });

    it('should throw BadRequestException for invalid ObjectId', async () => {
      const invalidId = 'invalid-id';
      const quantity = 5;

      await expect(service.updateStock(invalidId, quantity)).rejects.toThrow(BadRequestException);
      await expect(service.updateStock(invalidId, quantity)).rejects.toThrow('Invalid candle ID format');
    });

    it('should throw BadRequestException for invalid quantity', async () => {
      const candleId = '507f1f77bcf86cd799439011';
      const invalidQuantity = NaN;

      await expect(service.updateStock(candleId, invalidQuantity)).rejects.toThrow(BadRequestException);
      await expect(service.updateStock(candleId, invalidQuantity)).rejects.toThrow('Quantity must be a valid number');
    });

    it('should throw BadRequestException for non-number quantity', async () => {
      const candleId = '507f1f77bcf86cd799439011';
      const invalidQuantity = 'invalid' as any;

      await expect(service.updateStock(candleId, invalidQuantity)).rejects.toThrow(BadRequestException);
      await expect(service.updateStock(candleId, invalidQuantity)).rejects.toThrow('Quantity must be a valid number');
    });

    it('should throw BadRequestException when stock would go below zero', async () => {
      const candleId = '507f1f77bcf86cd799439011';
      const quantity = -15; // More than current stock of 10
      const candleWithLowStock = { ...mockCandle, stock: 5 };

      mockCandleModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(candleWithLowStock),
      });

      await expect(service.updateStock(candleId, quantity)).rejects.toThrow(BadRequestException);
      await expect(service.updateStock(candleId, quantity)).rejects.toThrow('Insufficient stock');
    });

    it('should allow stock to reach exactly zero', async () => {
      const candleId = '507f1f77bcf86cd799439011';
      const quantity = -10; // Exactly the current stock
      const updatedCandle = { ...mockCandle, stock: 0 };

      mockCandleModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCandle),
      });
      mockCandleModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedCandle),
      });

      const result = await service.updateStock(candleId, quantity);

      expect(result.stock).toBe(0);
    });

    it('should throw NotFoundException when candle not found during initial check', async () => {
      const candleId = '507f1f77bcf86cd799439011';
      const quantity = 5;

      mockCandleModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.updateStock(candleId, quantity)).rejects.toThrow(NotFoundException);
      await expect(service.updateStock(candleId, quantity)).rejects.toThrow('Candle not found');
    });

    it('should throw NotFoundException when candle not found during update', async () => {
      const candleId = '507f1f77bcf86cd799439011';
      const quantity = 5;

      mockCandleModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCandle),
      });
      mockCandleModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      // test updateStock with invalid ObjectId
      await expect(service.updateStock(candleId, quantity)).rejects.toThrow(NotFoundException);
      await expect(service.updateStock(candleId, quantity)).rejects.toThrow('Candle not found');
    });
  });
});
