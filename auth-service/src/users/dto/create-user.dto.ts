export class CreateUserDto {
  readonly email: string;
  readonly password: string;
  readonly roles: string; // ex: 'USER', OPERATOR', 'AUDITOR', 'ADMIN'
}
