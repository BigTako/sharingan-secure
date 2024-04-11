import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { CryptoService } from './crypto.service';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { ErrorMessage, OneArgMessage, TwoArgsMessage } from '../config';

@Injectable()
export class AuthService {
  private errorMessages: Record<string, ErrorMessage>;
  constructor(
    private userService: UserService,
    private cryptoService: CryptoService,
    private configService: ConfigService,
    @InjectRedis() private redis: Redis,
  ) {
    this.errorMessages = this.configService.get('errorMessages');
  }
  async singUp(data: CreateUserDto) {
    const { ENTITY_EXISTS, UNKNOWN } = this.errorMessages as {
      ENTITY_EXISTS: TwoArgsMessage;
      UNKNOWN: OneArgMessage;
    };
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
        throw new BadRequestException(ENTITY_EXISTS('User', field));
      }
      throw new BadRequestException(UNKNOWN('Please try again later.'));
    }
  }

  async logIn({ username, password }: LoginDto) {
    const { INVALID_CREDENTIALS } = this.errorMessages;
    const user = await this.userService.findOne({ username });

    if (!(await this.cryptoService.correctPassword(user.password, password))) {
      throw new BadRequestException(INVALID_CREDENTIALS);
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
