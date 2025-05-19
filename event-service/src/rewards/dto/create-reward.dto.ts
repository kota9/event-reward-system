import {
  IsString,
  IsNotEmpty,
  IsIn,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateRewardDto {
  @IsString()
  @IsNotEmpty()
  readonly eventId: string;

  @IsIn(['point', 'item', 'coupon'])
  readonly type: 'point' | 'item' | 'coupon';

  @IsNumber()
  @Min(1)
  readonly amount: number;
}
