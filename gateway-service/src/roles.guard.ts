import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user || !user.roles) {
      throw new ForbiddenException("User does not have roles");
    }
    const hasRole = () => user.roles.some((role) => requiredRoles.includes(role));
    if (!hasRole()) {
      throw new ForbiddenException("User does not have the required role");
    }
    return true;
  }
}