import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';

type PostInterceptorHandler = (data: any, context: ExecutionContext) => any;

export class PostHandlingInterceptor implements NestInterceptor {
  constructor(private fn: PostInterceptorHandler) {}

  intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
    return handler.handle().pipe(
      map((data: any) => {
        return this.fn(data, context);
      }),
    );
  }
}
