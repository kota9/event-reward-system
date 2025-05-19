import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type RewardDocument = Reward & Document;

@Schema({ timestamps: true })
export class Reward {
  @Prop({ required: true }) eventId: string;
  @Prop({ enum: ['point','item','coupon'] }) type: string;
  @Prop({ required: true }) amount: number;
}
export const RewardSchema = SchemaFactory.createForClass(Reward);
