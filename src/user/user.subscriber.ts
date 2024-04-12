import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { CryptoService } from './services';
import { User } from './user.entity';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  constructor(
    connection: Connection,
    private cryptoService: CryptoService,
  ) {
    connection.subscribers.push(this);
  }

  listenTo() {
    return User;
  }

  async beforeInsert(event: InsertEvent<User>) {
    event.entity.password = await this.cryptoService.hashPassword(
      event.entity.password,
    );
  }
}
