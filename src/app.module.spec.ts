import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should have AppController', () => {
    const controller = module.get<AppController>(AppController);
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(AppController);
  });

  it('should have AppService', () => {
    const service = module.get<AppService>(AppService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(AppService);
  });

  it('should inject AppService into AppController', () => {
    const controller = module.get<AppController>(AppController);
    const service = module.get<AppService>(AppService);
    
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
    
    // Verify that the controller has access to the service
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect((controller as any).appService).toBeDefined();
  });
});
