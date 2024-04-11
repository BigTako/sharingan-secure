import { Expose } from 'class-transformer';

export class AuthResponseDto {
  @Expose()
  jwt: string;
}
