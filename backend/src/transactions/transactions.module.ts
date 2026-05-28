import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsModule } from '../accounts/accounts.module';
import { CardsModule } from '../cards/cards.module';
import { Transaction } from './entities/transaction.entity';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    AccountsModule,
    CardsModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule { }
