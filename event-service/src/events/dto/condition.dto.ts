import { IsIn, IsNumber, Min } from 'class-validator';

export class ConditionDto {
  @IsIn(['login', 'invite'])
  readonly type: 'login' | 'invite';

  @IsNumber()
  @Min(1)
  readonly count: number;
}
