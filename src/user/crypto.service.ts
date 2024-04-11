import { BadRequestException, Injectable } from '@nestjs/common';

import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { JwtService } from '@nestjs/jwt';

const scrypt = promisify(_scrypt);
import crypto from 'crypto';
import { User } from './user.entity';

@Injectable()
export class CryptoService {
  constructor(private jwtService: JwtService) {}

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

  async createJWTToken(user: User): Promise<string> {
    return await this.jwtService.signAsync({ id: user.id });
  }

  private hashSHA256(str: string): string {
    return crypto.createHash('sha256').update(str).digest('hex');
  }

  async singToken(user: User): Promise<string> {
    try {
      return await this.jwtService.signAsync({
        user: { ...user, password: undefined },
      });
    } catch (e) {
      throw new BadRequestException('Unable to create JWT token.');
    }
  }

  async createAndHashRandomToken() {
    const token = crypto.randomBytes(32).toString('hex');

    const hashedToken = this.hashSHA256(token);

    return { token, hashedToken };
  }
}
