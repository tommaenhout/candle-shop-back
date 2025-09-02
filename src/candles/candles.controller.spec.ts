/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { CandlesController } from './candles.controller';
import { CandlesService } from './candles.service';
import { CreateCandleDto } from './dto/create-candle.dto';
import { UpdateCandleDto } from './dto/update-candle.dto';

describe('CandlesController', () => {
  let controller: CandlesController;
  let service: CandlesService;

  const mockCandle = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Vanilla Dream',
    description: 'A sweet vanilla scented candle',
    price: 25.99,
    stock: 10,
    scent: 'vanilla',
    size: 'medium',
    isActive: true,
    tags: ['sweet', 'relaxing'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCandlesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByScent: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    updateStock: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CandlesController],
      providers: [
        {
          provide: CandlesService,
          useValue: mockCandlesService,
        },
      ],
    }).compile();

    controller = module.get<CandlesController>(CandlesController);
    service = module.get<CandlesService>(CandlesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new candle', async () => {
      const createCandleDto: CreateCandleDto = {
        name: 'Lavender Bliss',
        description: 'Calming lavender scented candle',
        price: 29.99,
        stock: 15,
        scent: 'lavender',
        size: 'large',
        tags: ['calming', 'floral'],
      };

      mockCandlesService.create.mockResolvedValue(mockCandle);

      const result = await controller.create(createCandleDto);

      expect(service.create).toHaveBeenCalledWith(createCandleDto);
      expect(result).toEqual(mockCandle);
    });
  });

  describe('findAll', () => {
    it('should return all candles when no scent filter is provided', async () => {
      const mockCandles = [mockCandle];
      mockCandlesService.findAll.mockResolvedValue(mockCandles);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(service.findByScent).not.toHaveBeenCalled();
      expect(result).toEqual(mockCandles);
    });

    it('should return candles filtered by scent when scent parameter is provided', async () => {
      const mockCandles = [mockCandle];
      const scent = 'vanilla';
      mockCandlesService.findByScent.mockResolvedValue(mockCandles);

      const result = await controller.findAll(scent);

      expect(service.findByScent).toHaveBeenCalledWith(scent);
      expect(service.findAll).not.toHaveBeenCalled();
      expect(result).toEqual(mockCandles);
    });
  });

  describe('findOne', () => {
    it('should return a single candle by id', async () => {
      const id = '507f1f77bcf86cd799439011';
      mockCandlesService.findOne.mockResolvedValue(mockCandle);

      const result = await controller.findOne(id);

      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockCandle);
    });

    it('should return null when candle is not found', async () => {
      const id = '507f1f77bcf86cd799439012';
      mockCandlesService.findOne.mockResolvedValue(null);

      const result = await controller.findOne(id);

      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a candle', async () => {
      const id = '507f1f77bcf86cd799439011';
      const updateCandleDto: UpdateCandleDto = {
        name: 'Updated Vanilla Dream',
        price: 27.99,
      };
      const updatedCandle = { ...mockCandle, ...updateCandleDto };
      mockCandlesService.update.mockResolvedValue(updatedCandle);

      const result = await controller.update(id, updateCandleDto);

      expect(service.update).toHaveBeenCalledWith(id, updateCandleDto);
      expect(result).toEqual(updatedCandle);
    });

    it('should return null when trying to update non-existent candle', async () => {
      const id = '507f1f77bcf86cd799439012';
      const updateCandleDto: UpdateCandleDto = {
        name: 'Non-existent Candle',
      };
      mockCandlesService.update.mockResolvedValue(null);

      const result = await controller.update(id, updateCandleDto);

      expect(service.update).toHaveBeenCalledWith(id, updateCandleDto);
      expect(result).toBeNull();
    });
  });

  describe('updateStock', () => {
    it('should update candle stock by adding quantity', async () => {
      const id = '507f1f77bcf86cd799439011';
      const quantity = 5;
      const updatedCandle = { ...mockCandle, stock: mockCandle.stock + quantity };
      mockCandlesService.updateStock.mockResolvedValue(updatedCandle);

      const result = await controller.updateStock(id, quantity);

      expect(service.updateStock).toHaveBeenCalledWith(id, quantity);
      expect(result).toEqual(updatedCandle);
    });

    it('should update candle stock by subtracting quantity', async () => {
      const id = '507f1f77bcf86cd799439011';
      const quantity = -3;
      const updatedCandle = { ...mockCandle, stock: mockCandle.stock + quantity };
      mockCandlesService.updateStock.mockResolvedValue(updatedCandle);

      const result = await controller.updateStock(id, quantity);

      expect(service.updateStock).toHaveBeenCalledWith(id, quantity);
      expect(result).toEqual(updatedCandle);
    });

    it('should return null when trying to update stock of non-existent candle', async () => {
      const id = '507f1f77bcf86cd799439012';
      const quantity = 5;
      mockCandlesService.updateStock.mockResolvedValue(null);

      const result = await controller.updateStock(id, quantity);

      expect(service.updateStock).toHaveBeenCalledWith(id, quantity);
      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should soft delete a candle by setting isActive to false', async () => {
      const id = '507f1f77bcf86cd799439011';
      const deletedCandle = { ...mockCandle, isActive: false };
      mockCandlesService.remove.mockResolvedValue(deletedCandle);

      const result = await controller.remove(id);

      expect(service.remove).toHaveBeenCalledWith(id);
      expect(result).toEqual(deletedCandle);
    });

    it('should return null when trying to delete non-existent candle', async () => {
      const id = '507f1f77bcf86cd799439012';
      mockCandlesService.remove.mockResolvedValue(null);

      const result = await controller.remove(id);

      expect(service.remove).toHaveBeenCalledWith(id, );
      expect(result).toBeNull();
    });
  });
});
