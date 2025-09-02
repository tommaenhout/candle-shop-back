import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CandleDocument = Candle & Document;

@Schema({ timestamps: true })
export class Candle {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true, min: 0 })
  stock: number;

  @Prop({ required: true })
  scent: string;

  @Prop({ required: true, enum: ['small', 'medium', 'large'] })
  size: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop([String])
  tags: string[];
}

export const CandleSchema = SchemaFactory.createForClass(Candle);
