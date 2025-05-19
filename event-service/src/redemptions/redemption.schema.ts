import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type RedemptionDocument = Redemption & Document;

@Schema({ timestamps: true })
export class Redemption {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ type: Types.ObjectId, ref: 'Event', required: true })
  eventId: string;
  
  @Prop({ type: Types.ObjectId, ref: 'Reward', required: true })
  rewardId: string;

  @Prop({ enum: ['SUCCESS', 'FAILED'], default: 'FAILED' })
  status: 'SUCCESS' | 'FAILED';

  @Prop()
  reason?: string;
}

export const RedemptionSchema = SchemaFactory.createForClass(Redemption);