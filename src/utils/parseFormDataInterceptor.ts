import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { isJSON } from 'class-validator';
import { Observable, map } from 'rxjs';

@Injectable()
export class BodyParseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();

    try {
      const body = request.body;

      if (typeof body === 'object' && body !== null) {
        for (const key in body) {
          if (isJSON(body[key])) {
            const parsedValue = JSON.parse(body[key]);

            body[key] = parsedValue;
          }
        }
      }

      return next.handle().pipe(
        map((data) => {
          return {
            ...data,
            modified: true,
          };
        }),
      );
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}
