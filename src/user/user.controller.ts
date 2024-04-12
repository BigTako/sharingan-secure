import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { Serialize } from '../decorators/serialize.decorator';
import {
  AuthResponseDto,
  CreateUserDto,
  UserResponseDto,
  LoginDto,
} from './dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthGuard } from '../guards/auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @Serialize(AuthResponseDto)
  async signIn(@Body() body: CreateUserDto) {
    return await this.authService.singUp(body);
  }

  @Post('login')
  @Serialize(AuthResponseDto)
  async logIn(@Body() body: LoginDto) {
    return await this.authService.logIn(body);
  }

  @Get('me')
  @Serialize(UserResponseDto)
  @UseGuards(AuthGuard)
  async getMe(@CurrentUser() user: any) {
    return user;
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  async logOut(@Req() request: Request) {
    const token: string = request['token'];
    return await this.authService.logOut(token);
  }
}
