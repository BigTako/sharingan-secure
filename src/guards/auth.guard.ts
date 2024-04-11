import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Redis } from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @InjectRedis() private redis: Redis,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException(
        'You are not authorized to access this resource.',
      );
    }

    const isWhitelisted = await this.redis.exists(`whitelist:${token}`);

    if (!isWhitelisted) {
      throw new UnauthorizedException(
        'You are not authorized to access this resource.',
      );
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      request['user'] = payload?.user || {};
      request['token'] = token;
    } catch (error: any) {
      throw new UnauthorizedException(
        'You are not authorized to access this resource.',
      );
    }
    return true;
  }

  private extractTokenFromHeader(req: Request): string | undefined {
    let token: string;
    if (req?.headers?.authorization) {
      const [type, reqToken] = req.headers?.authorization?.split(' ');
      if (type && type === 'Bearer' && reqToken && reqToken !== 'null') {
        token = reqToken;
      }
    }
    return token;
  }
}
