import { SetMetadata } from '@nestjs/common';

/**
 * Use @Roles(...roles) to specify required roles on route handlers
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);