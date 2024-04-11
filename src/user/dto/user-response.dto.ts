import { Optional } from '@nestjs/common';
import { Expose } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  @Optional()
  fullName: string;

  @Expose()
  username: string;

  @Expose()
  createdAt: Date;
}
