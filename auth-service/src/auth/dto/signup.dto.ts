import { IsEmail, IsString, MinLength, IsOptional, IsArray } from 'class-validator';

export class SignUpDto {
  @IsEmail()
  readonly email: string;

  @IsString()
  @MinLength(6)
  readonly password: string;

  @IsOptional()
  @IsArray()
  readonly roles: string;
}
