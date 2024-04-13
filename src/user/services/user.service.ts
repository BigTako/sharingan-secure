import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { ErrorMessage, OneArgMessage } from '../../config';
import { CreateUserDto } from '../dto';
import { User } from '../user.entity';

@Injectable()
export class UserService {
  private errorMessages: Record<string, ErrorMessage>;

  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    private configService: ConfigService,
  ) {
    this.errorMessages = this.configService.get('errorMessages');
  }
  async create(user: CreateUserDto): Promise<User> {
    // using insert and save because insert does not return the inserted document
    const doc = this.repo.create(user as CreateUserDto);
    await this.repo.save(doc);
    return doc;
  }

  async findOne(where: FindOptionsWhere<User>) {
    const user = await this.repo.findOne({ where });
    const { ENTITY_NOT_FOUND } = this.errorMessages as {
      ENTITY_NOT_FOUND: OneArgMessage;
    };
    if (!user) {
      throw new NotFoundException(ENTITY_NOT_FOUND('User'));
    }
    return user;
  }
}
