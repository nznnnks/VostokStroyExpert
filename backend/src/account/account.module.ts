import { Module } from '@nestjs/common';

import { OrdersModule } from '../orders/orders.module';
import { UsersModule } from '../users/users.module';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';

@Module({
  imports: [UsersModule, OrdersModule],
  controllers: [AccountController],
  providers: [AccountService],
})
export class AccountModule {}
