import { IsString } from 'class-validator';

export class CreateRedemptionDto {
  @IsString()
  readonly userId: string;

  @IsString()
  readonly eventId: string;

  @IsString()
  readonly rewardId: string;
}