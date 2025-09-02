/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unnecessary-type-assertion */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';

describe('CandlesController (e2e)', () => {
  let app: INestApplication;
  let createdCandleId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Enable validation pipes like in main.ts
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/candles (POST)', () => {
    it('should create a new candle', async () => {
      const createCandleDto = {
        name: 'Test Vanilla Candle',
        description: 'A test vanilla-scented candle',
        price: 25.99,
        stock: 10,
        scent: 'vanilla',
        size: 'medium',
        tags: ['sweet', 'relaxing'],
      };

      const response = await request(app.getHttpServer())
        .post('/candles')
        .send(createCandleDto)
        .expect(201);

      const candle = response.body as any;
      expect(candle).toHaveProperty('_id');
      expect(candle.name).toBe(createCandleDto.name);
      expect(candle.description).toBe(createCandleDto.description);
      expect(candle.price).toBe(createCandleDto.price);
      expect(candle.stock).toBe(createCandleDto.stock);
      expect(candle.scent).toBe(createCandleDto.scent);
      expect(candle.size).toBe(createCandleDto.size);
      expect(candle.isActive).toBe(true);
      expect(candle.tags).toEqual(createCandleDto.tags);
      expect(candle).toHaveProperty('createdAt');
      expect(candle).toHaveProperty('updatedAt');

      // Store the ID for other tests
      createdCandleId = candle._id as string;
    });

    it('should return 400 for invalid candle data', async () => {
      const invalidCandleDto = {
        name: '', // Invalid: empty name
        price: -10, // Invalid: negative price
        stock: 'invalid', // Invalid: non-number stock
      };

      await request(app.getHttpServer())
        .post('/candles')
        .send(invalidCandleDto)
        .expect(400);
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteCandleDto = {
        name: 'Test Candle',
        // Missing required fields like price, stock, etc.
      };

      await request(app.getHttpServer())
        .post('/candles')
        .send(incompleteCandleDto)
        .expect(400);
    });
  });

  describe('/candles (GET)', () => {
    it('should return all active candles', async () => {
      const response = await request(app.getHttpServer())
        .get('/candles')
        .expect(200);

      const candles = response.body as any[];
      expect(Array.isArray(candles)).toBe(true);
      expect(candles.length).toBeGreaterThan(0);
      
      // Check that all returned candles are active
      candles.forEach((candle: any) => {
        expect(candle.isActive).toBe(true);
        expect(candle).toHaveProperty('_id');
        expect(candle).toHaveProperty('name');
        expect(candle).toHaveProperty('price');
        expect(candle).toHaveProperty('stock');
      });
    });

    it('should filter candles by scent', async () => {
      const response = await request(app.getHttpServer())
        .get('/candles?scent=vanilla')
        .expect(200);

      const candles = response.body as any[];
      expect(Array.isArray(candles)).toBe(true);
      
      // All returned candles should contain 'vanilla' in their scent (case-insensitive)
      candles.forEach((candle: any) => {
        expect(candle.scent.toLowerCase()).toContain('vanilla');
        expect(candle.isActive).toBe(true);
      });
    });

    it('should return empty array for non-existent scent', async () => {
      const response = await request(app.getHttpServer())
        .get('/candles?scent=nonexistentscent')
        .expect(200);

      const candles = response.body as any[];
      expect(Array.isArray(candles)).toBe(true);
      expect(candles.length).toBe(0);
    });
  });

  describe('/candles/:id (GET)', () => {
    it('should return a specific candle by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/candles/${createdCandleId}`)
        .expect(200);

      const candle = response.body as any;
      expect(candle._id).toBe(createdCandleId);
      expect(candle).toHaveProperty('name');
      expect(candle).toHaveProperty('description');
      expect(candle).toHaveProperty('price');
      expect(candle).toHaveProperty('stock');
      expect(candle).toHaveProperty('scent');
      expect(candle).toHaveProperty('size');
      expect(candle).toHaveProperty('isActive');
      expect(candle).toHaveProperty('tags');
    });

    it('should return 404 for non-existent candle ID', async () => {
      const nonExistentId = '507f1f77bcf86cd799439999';
      
      await request(app.getHttpServer())
        .get(`/candles/${nonExistentId}`)
        .expect(404);
    });

    it('should return 400 for invalid candle ID format', async () => {
      const invalidId = 'invalid-id-format';
      
      await request(app.getHttpServer())
        .get(`/candles/${invalidId}`)
        .expect(400);
    });
  });

  describe('/candles/:id (PATCH)', () => {
    it('should update a candle successfully', async () => {
      const updateCandleDto = {
        name: 'Updated Test Candle',
        description: 'Updated description',
        price: 29.99,
        tags: ['updated', 'premium'],
      };

      const response = await request(app.getHttpServer())
        .patch(`/candles/${createdCandleId}`)
        .send(updateCandleDto)
        .expect(200);

      const candle = response.body as any;
      expect(candle._id).toBe(createdCandleId);
      expect(candle.name).toBe(updateCandleDto.name);
      expect(candle.description).toBe(updateCandleDto.description);
      expect(candle.price).toBe(updateCandleDto.price);
      expect(candle.tags).toEqual(updateCandleDto.tags);
      expect(candle.updatedAt).toBeDefined();
    });

    it('should return 404 for updating non-existent candle', async () => {
      const nonExistentId = '507f1f77bcf86cd799439999';
      const updateDto = { name: 'Updated Name' };

      await request(app.getHttpServer())
        .patch(`/candles/${nonExistentId}`)
        .send(updateDto)
        .expect(404);
    });

    it('should return 400 for invalid update data', async () => {
      const invalidUpdateDto = {
        price: -50, // Invalid: negative price
        stock: 'invalid', // Invalid: non-number stock
      };

      await request(app.getHttpServer())
        .patch(`/candles/${createdCandleId}`)
        .send(invalidUpdateDto)
        .expect(400);
    });
  });

  describe('/candles/:id/stock (PATCH)', () => {
    it('should increase stock successfully', async () => {
      const stockIncrease = { quantity: 5 };

      const response = await request(app.getHttpServer())
        .patch(`/candles/${createdCandleId}/stock`)
        .send(stockIncrease)
        .expect(200);

      const candle = response.body as any;
      expect(candle._id).toBe(createdCandleId);
      expect(candle.stock).toBeGreaterThan(0);
      expect(candle.updatedAt).toBeDefined();
    });

    it('should decrease stock successfully', async () => {
      // First get current stock
      const currentCandle = await request(app.getHttpServer())
        .get(`/candles/${createdCandleId}`)
        .expect(200);

      const currentStock = (currentCandle.body as any).stock as number;
      const stockDecrease = { quantity: -2 };

      const response = await request(app.getHttpServer())
        .patch(`/candles/${createdCandleId}/stock`)
        .send(stockDecrease)
        .expect(200);

      const candle = response.body as any;
      expect(candle._id).toBe(createdCandleId);
      expect(candle.stock).toBe(currentStock - 2);
    });

    it('should return 404 for updating stock of non-existent candle', async () => {
      const nonExistentId = '507f1f77bcf86cd799439999';
      const stockUpdate = { quantity: 5 };

      await request(app.getHttpServer())
        .patch(`/candles/${nonExistentId}/stock`)
        .send(stockUpdate)
        .expect(404);
    });

    it('should return 400 for invalid stock quantity', async () => {
      const invalidStockUpdate = { quantity: 'invalid' };

      await request(app.getHttpServer())
        .patch(`/candles/${createdCandleId}/stock`)
        .send(invalidStockUpdate)
        .expect(400);
    });

    it('should return 400 when trying to reduce stock below zero', async () => {
      // First get current stock
      const currentCandle = await request(app.getHttpServer())
        .get(`/candles/${createdCandleId}`)
        .expect(200);

      const currentStock = (currentCandle.body as any).stock as number;
      const excessiveDecrease = { quantity: -(currentStock + 1) };

      const response = await request(app.getHttpServer())
        .patch(`/candles/${createdCandleId}/stock`)
        .send(excessiveDecrease)
        .expect(400);

      // Verify error message mentions insufficient stock
      expect(response.body.message).toContain('Insufficient stock');
    });

    it('should allow stock to reach exactly zero', async () => {
      // First get current stock
      const currentCandle = await request(app.getHttpServer())
        .get(`/candles/${createdCandleId}`)
        .expect(200);

      const currentStock = (currentCandle.body as any).stock as number;
      const reduceToZero = { quantity: -currentStock };

      const response = await request(app.getHttpServer())
        .patch(`/candles/${createdCandleId}/stock`)
        .send(reduceToZero)
        .expect(200);

      const candle = response.body as any;
      expect(candle.stock).toBe(0);
    });
  });

  describe('/candles/:id (DELETE)', () => {
    it('should soft delete a candle (set isActive to false)', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/candles/${createdCandleId}`)
        .expect(200);

      const candle = response.body as any;
      expect(candle._id).toBe(createdCandleId);
      expect(candle.isActive).toBe(false);
      expect(candle.updatedAt).toBeDefined();
    });

    it('should not return soft-deleted candles in findAll', async () => {
      const response = await request(app.getHttpServer())
        .get('/candles')
        .expect(200);

      // The soft-deleted candle should not appear in the list
      const candles = response.body as any[];
      const deletedCandle = candles.find((candle: any) => candle._id === createdCandleId);
      expect(deletedCandle).toBeUndefined();
    });

    it('should still be able to get soft-deleted candle by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/candles/${createdCandleId}`)
        .expect(200);

      const candle = response.body as any;
      expect(candle._id).toBe(createdCandleId);
      expect(candle.isActive).toBe(false);
    });

    it('should return 404 for deleting non-existent candle', async () => {
      const nonExistentId = '507f1f77bcf86cd799439999';

      await request(app.getHttpServer())
        .delete(`/candles/${nonExistentId}`)
        .expect(404);
    });
  });
});
