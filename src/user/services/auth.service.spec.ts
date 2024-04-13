import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { FindOptionsWhere } from 'typeorm';
import { errorMessagesConfig } from '../../config';
import { CreateUserDto } from '../dto';
import { AuthService, CryptoService, UserService } from '../services';
import { User } from '../user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let id = 1;
  const mockDB = [];
  const mockRedisStorage = {};
  beforeEach(async () => {
    const mockRedis = {
      set: (key: string, value: string) => {
        mockRedisStorage[key] = value;
        return Promise.resolve('OK');
      },
      get: (key: string) => {
        return Promise.resolve(mockRedisStorage[key] || null);
      },
      del: (key: string) => {
        const existed = Boolean(mockRedisStorage[key]);
        delete mockRedisStorage[key];
        return Promise.resolve(existed ? 1 : 0);
      },
    };

    const mockUserService = {
      create: (user: CreateUserDto) => {
        const newUser = { ...user, id: String(id++), createdAt: new Date() };
        mockDB.push(newUser);
        return newUser;
      },
      findOne: (where: FindOptionsWhere<User>) => {
        const user = mockDB.find((u) => u.username === where.username);
        return user;
      },
    };

    const mockCryptoService = {
      hashPassword: (password: string) => password,
      correctPassword: (storedPassword: string, suppliedPassword: string) =>
        storedPassword === suppliedPassword,
      singToken: (user: User) => Promise.resolve(user.username),
    };
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
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: CryptoService,
          useValue: mockCryptoService,
        },
        {
          provide: 'default_IORedisModuleConnectionToken',
          useValue: mockRedis,
        },
      ],
    })
      .overrideProvider(UserService)
      .useValue(mockUserService)
      .compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create, set and return JWT token on signup', async () => {
    const user = {
      fullName: 'full name',
      username: 'username',
      password: 'password',
    };

    const { jwt } = await service.singUp(user);
    expect(jwt).toBeDefined();
    expect(jwt).toEqual(user.username);
    expect(mockRedisStorage).toHaveProperty(`whitelist:${jwt}`);
  });

  it('should set and return JWT token on login', async () => {
    const user = {
      fullName: 'full name',
      username: 'username',
      password: 'password',
    };

    await service.singUp(user);
    const { jwt } = await service.logIn({
      username: user.username,
      password: user.password,
    });
    expect(jwt).toBeDefined();
    expect(jwt).toEqual(user.username);
    expect(mockRedisStorage).toHaveProperty(`whitelist:${jwt}`);
  });

  it('should delete JWT token on logout', async () => {
    const user = {
      fullName: 'full name',
      username: 'username',
      password: 'password',
    };

    await service.singUp(user);
    const { jwt } = await service.logIn({
      username: user.username,
      password: user.password,
    });
    expect(mockRedisStorage).toHaveProperty(`whitelist:${jwt}`);
    await service.logOut(jwt);
    expect(mockRedisStorage).not.toHaveProperty(`whitelist:${jwt}`);
  });
});
