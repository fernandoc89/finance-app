import { Module } from '@nestjs/common';
import { AccountsModule } from '../accounts/accounts.module';
import { CardsModule } from '../cards/cards.module';
import { CategoriesModule } from '../categories/categories.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { UsersModule } from '../users/users.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    TransactionsModule,
    AccountsModule,
    CardsModule,
    CategoriesModule,
    UsersModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule { }
