import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ConflictException,
} from '@nestjs/common';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ConflictException('User not found. Invalid token. Relog pls.');
    }
    if (user.role === 'admin') {
      return true;
    } else {
      throw new ConflictException('Access denied. User role failed.');
    }
  }
}
