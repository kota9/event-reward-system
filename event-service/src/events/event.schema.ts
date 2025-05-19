import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Condition 서브도큐먼트
@Schema({ _id: false })
export class Condition {
  @Prop({ required: true, enum: ['login', 'invite'] })
  type: 'login' | 'invite';

  @Prop({ required: true, min: 1 })
  count: number;  // 예: 로그인 3일 -> count: 3, 친구 초대 2명 -> count: 2
}
export const ConditionSchema = SchemaFactory.createForClass(Condition);

export type EventDocument = Event & Document;

@Schema({ timestamps: true })
export class Event {
  @Prop({ required: true }) title: string;
  @Prop() description: string;
  @Prop({ type: Date }) startAt: Date;
  @Prop({ type: Date }) endAt: Date;
  @Prop({ default: true }) active: boolean;

  // 조건 배열 추가
  @Prop({ type: [ConditionSchema], default: [] })
  conditions: Condition[];
}

export const EventSchema = SchemaFactory.createForClass(Event);
