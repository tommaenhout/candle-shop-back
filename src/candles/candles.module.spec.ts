import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CandlesModule } from './candles.module';
import { CandlesController } from './candles.controller';
import { CandlesService } from './candles.service';
import { Candle } from '../schemas/candle.schema';

describe('CandlesModule', () => {
  let module: TestingModule;

  const mockCandleModel = {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    new: jest.fn(),
    constructor: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [CandlesModule],
    })
      .overrideProvider(getModelToken(Candle.name))
      .useValue(mockCandleModel)
      .compile();
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should have CandlesController', () => {
    const controller = module.get<CandlesController>(CandlesController);
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(CandlesController);
  });

  it('should have CandlesService', () => {
    const service = module.get<CandlesService>(CandlesService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(CandlesService);
  });

  it('should provide Candle model token', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const candleModel = module.get(getModelToken(Candle.name));
    expect(candleModel).toBeDefined();
    expect(candleModel).toBe(mockCandleModel);
  });

  it('should inject CandlesService into CandlesController', () => {
    const controller = module.get<CandlesController>(CandlesController);
    const service = module.get<CandlesService>(CandlesService);
    
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
    
    // Verify that the controller has access to the service
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect((controller as any).candlesService).toBeDefined();
  });
});
