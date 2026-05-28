import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Transaction, TransactionType } from '../transactions/entities/transaction.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Account } from './entities/account.entity';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
  ) { }

  async create(userId: string, createAccountDto: CreateAccountDto): Promise<Account> {
    const account = this.accountsRepository.create({
      ...createAccountDto,
      user: { id: userId },
    });

    return this.accountsRepository.save(account);
  }

  async findAllByUser(userId: string): Promise<Account[]> {
    return this.accountsRepository.find({
      where: { user: { id: userId } },
      order: { name: 'ASC' },
    });
  }

  async findById(id: string, userId: string): Promise<Account> {
    const account = await this.accountsRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!account) {
      throw new NotFoundException('Conta não encontrada');
    }

    return account;
  }

  async update(
    id: string,
    userId: string,
    updateAccountDto: UpdateAccountDto,
  ): Promise<Account> {
    const account = await this.findById(id, userId);

    Object.assign(account, updateAccountDto);
    return this.accountsRepository.save(account);
  }

  async remove(id: string, userId: string): Promise<void> {
    const account = await this.findById(id, userId);

    // Verificar se há transações vinculadas
    const transactionCount = await this.transactionsRepository.count({
      where: { account: { id } },
    });

    if (transactionCount > 0) {
      throw new BadRequestException(
        'Não é possível remover uma conta com transações vinculadas',
      );
    }

    await this.accountsRepository.remove(account);
  }

  async updateBalance(
    accountId: string,
    amount: number,
    type: TransactionType,
  ): Promise<void> {
    const account = await this.accountsRepository.findOne({
      where: { id: accountId },
    });

    if (!account) {
      throw new NotFoundException('Conta não encontrada');
    }

    if (type === TransactionType.INCOME) {
      account.balance = Number(account.balance) + Number(amount);
    } else if (type === TransactionType.EXPENSE || type === TransactionType.TRANSFER) {
      account.balance = Number(account.balance) - Number(amount);
    }

    await this.accountsRepository.save(account);
  }

  async getBalanceHistory(
    accountId: string,
    userId: string,
    startDate: Date,
    endDate: Date,
  ) {
    const account = await this.findById(accountId, userId);

    const transactions = await this.transactionsRepository.find({
      where: {
        account: { id: accountId },
        date: Between(startDate, endDate),
      },
      order: { date: 'ASC' },
    });

    let runningBalance = Number(account.balance);
    const history: Array<{
      date: Date;
      balance: number;
      transaction: {
        id: string;
        description: string;
        amount: number;
        type: TransactionType;
      };
    }> = [];

    for (const transaction of transactions.reverse()) {
      history.unshift({
        date: transaction.date,
        balance: runningBalance,
        transaction: {
          id: transaction.id,
          description: transaction.description,
          amount: transaction.amount,
          type: transaction.type,
        },
      });

      if (transaction.type === TransactionType.INCOME) {
        runningBalance -= Number(transaction.amount);
      } else {
        runningBalance += Number(transaction.amount);
      }
    }

    return {
      account: {
        id: account.id,
        name: account.name,
        currentBalance: account.balance,
      },
      history,
    };
  }
}
