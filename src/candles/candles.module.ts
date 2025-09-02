import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CandlesService } from './candles.service';
import { CandlesController } from './candles.controller';
import { Candle, CandleSchema } from '../schemas/candle.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Candle.name, schema: CandleSchema }]),
  ],
  controllers: [CandlesController],
  providers: [CandlesService],
  exports: [CandlesService],
})
export class CandlesModule {}
