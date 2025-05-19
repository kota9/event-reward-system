import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwt: JwtService) {}
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const auth = req.headers.authorization?.split(' ');
    if (!auth || auth[0] !== 'Bearer') {
      throw new UnauthorizedException('No token provided');
    }
    try {
      req.user = this.jwt.verify(auth[1], { secret: process.env.JWT_SECRET });
      return true;
    } catch (error) {
      throw new UnauthorizedException("Invalid token");
    }
  }
}
