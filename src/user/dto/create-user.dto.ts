import { IsOptional, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  fullName: string;

  @IsString()
  @Length(8, 256)
  password: string;
}
