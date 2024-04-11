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
import { ErrorMessage } from '../config';

@Injectable()
export class AuthGuard implements CanActivate {
  private errorMessages: Record<string, ErrorMessage>;

  constructor(
    @InjectRedis() private redis: Redis,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.errorMessages = this.configService.get('errorMessages');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    const { UNATHORIZED } = this.errorMessages;

    if (!token) {
      throw new UnauthorizedException(UNATHORIZED);
    }

    const isWhitelisted = await this.redis.exists(`whitelist:${token}`);

    if (!isWhitelisted) {
      throw new UnauthorizedException(UNATHORIZED);
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      request['user'] = payload?.user || {};
      request['token'] = token;
    } catch (error: any) {
      throw new UnauthorizedException(UNATHORIZED);
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
