import { UseInterceptors } from '@nestjs/common';

import { plainToClass } from 'class-transformer';
import { PostHandlingInterceptor } from '../interceptors/post-handling.interceptor';

interface ClassConstructor {
  new (...args: any[]): object; // means class
}

export function Serialize(dto: ClassConstructor) {
  const serialize = (data: any) => {
    return plainToClass(dto, data, { excludeExtraneousValues: true });
  };
  return UseInterceptors(new PostHandlingInterceptor(serialize));
}
