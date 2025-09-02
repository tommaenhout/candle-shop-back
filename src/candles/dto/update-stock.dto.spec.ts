import { validate } from 'class-validator';
import { UpdateStockDto } from './update-stock.dto';

describe('UpdateStockDto', () => {
  let dto: UpdateStockDto;

  beforeEach(() => {
    dto = new UpdateStockDto();
  });

  describe('quantity validation', () => {
    it('should pass validation with valid positive number', async () => {
      dto.quantity = 5;
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with valid negative number', async () => {
      dto.quantity = -3;
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with zero', async () => {
      dto.quantity = 0;
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with decimal number', async () => {
      dto.quantity = 2.5;
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with string', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (dto as any).quantity = 'invalid';
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('quantity');
      expect(errors[0].constraints).toHaveProperty('isNumber');
    });

    it('should fail validation with null', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (dto as any).quantity = null;
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('quantity');
      expect(errors[0].constraints).toHaveProperty('isNumber');
    });

    it('should fail validation with undefined', async () => {
      dto.quantity = undefined as any;
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('quantity');
      expect(errors[0].constraints).toHaveProperty('isNumber');
    });

    it('should fail validation with boolean', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (dto as any).quantity = true;
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('quantity');
      expect(errors[0].constraints).toHaveProperty('isNumber');
    });

    it('should fail validation with array', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (dto as any).quantity = [1, 2, 3];
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('quantity');
      expect(errors[0].constraints).toHaveProperty('isNumber');
    });

    it('should fail validation with object', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (dto as any).quantity = { value: 5 };
      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('quantity');
      expect(errors[0].constraints).toHaveProperty('isNumber');
    });
  });
});
