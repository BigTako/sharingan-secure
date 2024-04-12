import { Test, TestingModule } from '@nestjs/testing';
import { CryptoService } from './crypto.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { errorMessagesConfig } from '../../config';
import { User } from '../user.entity';

describe('CryptoService', () => {
  let service: CryptoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: `.env`,
          load: [errorMessagesConfig],
          expandVariables: true,
          isGlobal: true,
        }),
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            global: true,
            secret: configService.get<string>('JWT_SECRET'),
          }),
          inject: [ConfigService],
        }),
      ],
      providers: [CryptoService],
    }).compile();

    service = module.get<CryptoService>(CryptoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should hash a password', async () => {
    const password = 'password';
    const hashedPassword = await service.hashPassword(password);
    expect(hashedPassword).toBeDefined();
    expect(hashedPassword).not.toEqual(password);
  });

  it('should compare a password and a hash', async () => {
    const password = 'password';
    const hashedPassword = await service.hashPassword(password);

    const isMatch = await service.correctPassword(hashedPassword, password);
    expect(isMatch).toBe(true);
  });

  it('should not compare a password and a hash', async () => {
    const password = 'password';
    const hashedPassword = await service.hashPassword(password);
    const isMatch = await service.correctPassword(
      'wrongPassword',
      hashedPassword,
    );
    expect(isMatch).toBe(false);
  });

  it('should sign JWT token from user supplied', async () => {
    const user = {
      id: '1',
      fullName: 'full name',
      username: 'username',
      password: 'password',
    };

    const token = await service.singToken(user as User);

    expect(token).toBeDefined();
  });
});
