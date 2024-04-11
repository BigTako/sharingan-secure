import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './user.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}
  async create(user: CreateUserDto): Promise<User> {
    // using insert and save because insert does not return the inserted document
    const doc = this.repo.create(user as CreateUserDto);
    await this.repo.save(doc);
    return doc;
  }

  async findOne(where: FindOptionsWhere<User>) {
    const user = await this.repo.findOne({ where });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
