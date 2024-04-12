import { BadRequestException, Injectable } from '@nestjs/common';

import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { JwtService } from '@nestjs/jwt';

const scrypt = promisify(_scrypt);
import { User } from '../user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CryptoService {
  private errorMessages: Record<string, string>;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.errorMessages = this.configService.get('errorMessages');
  }

  async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(8).toString('hex');

    //Hash the salt and the password together
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    //Join the hashed result and the salt together
    return salt + '.' + hash.toString('hex');
  }

  async correctPassword(storedPassword: string, suppliedPassword: string) {
    const [salt, dbPassHash] = storedPassword.split('.'); // [salt, hash
    const suppliedPassHash = (await scrypt(
      suppliedPassword,
      salt,
      32,
    )) as Buffer;

    return dbPassHash === suppliedPassHash.toString('hex');
  }

  async singToken(user: User): Promise<string> {
    const { JWT_CREATION_ERROR } = this.errorMessages;
    try {
      return await this.jwtService.signAsync({
        user: { ...user, password: undefined },
      });
    } catch (e) {
      throw new BadRequestException(JWT_CREATION_ERROR);
    }
  }
}
