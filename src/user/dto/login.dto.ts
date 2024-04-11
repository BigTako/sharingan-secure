import { IsString, Length } from 'class-validator';

export class LoginDto {
  @IsString()
  username: string;

  @IsString()
  @Length(8, 256)
  password: string;
}
