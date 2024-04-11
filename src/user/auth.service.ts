import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { CryptoService } from './crypto.service';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private cryptoService: CryptoService,
    @InjectRedis() private redis: Redis,
  ) {}
  async singUp(data: CreateUserDto) {
    try {
      const user = await this.userService.create(data);
      const jwt = await this.cryptoService.singToken(user);
      // const jti = uuidv4();
      await this.redis.set(
        `whitelist:${jwt}`,
        '',
        'EX',
        +process.env.JWT_EXPIRES_IN,
      );
      return { jwt };
    } catch (error: any) {
      if (error.code === '23505') {
        // extract the field name from the error message
        const fieldRegexp = /Key \((.*?)\)=/;
        const match = error.detail.match(fieldRegexp);
        const field = match ? match[1] : 'X';
        throw new BadRequestException(
          `User with this ${field} already exists.Please try another one.`,
        );
      }
      throw new BadRequestException(
        `Something went wrong. ${process.env.NODE_ENV !== 'production' ? error.message : ''}`,
      );
    }
  }

  async logIn({ username, password }: LoginDto) {
    const user = await this.userService.findOne({ username });

    if (!(await this.cryptoService.correctPassword(user.password, password))) {
      throw new BadRequestException('Invalid login or password');
    }

    const jwt = await this.cryptoService.singToken(user);

    await this.redis.set(
      `whitelist:${jwt}`,
      '',
      'EX',
      +process.env.JWT_EXPIRES_IN,
    );
    return { jwt };
  }

  async logOut(token: string) {
    await this.redis.del(`whitelist:${token}`);
    return null;
  }
}
