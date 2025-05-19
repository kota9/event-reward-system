import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // @Roles 데코레이터로 지정된 권한 조회
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // 권한 체크 안 함
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user || user.roles === undefined) {
      throw new ForbiddenException('권한이 없습니다.');
    }

    // user.roles가 문자열일 때 처리
    if (typeof user.roles === 'string') {
      if (!requiredRoles.includes(user.roles)) {
        throw new ForbiddenException('권한이 없습니다.');
      }
      return true;
    }

    throw new ForbiddenException('권한 정보 형식이 올바르지 않습니다.');
  }
}