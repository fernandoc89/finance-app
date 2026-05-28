import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { AccountsService } from '../accounts/accounts.service';
import { CardsService } from '../cards/cards.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Category } from '../categories/entities/category.entity';
import { PaymentMethod, Transaction, TransactionType } from './entities/transaction.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    private accountsService: AccountsService,
    private cardsService: CardsService,
  ) { }

  async create(userId: string, createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    // Validar conta/cartão conforme método de pagamento
    if (createTransactionDto.paymentMethod === PaymentMethod.CREDIT) {
      if (!createTransactionDto.cardId) {
        throw new BadRequestException('Cartão é obrigatório para pagamentos com crédito');
      }
    } else if (
      [PaymentMethod.DEBIT, PaymentMethod.PIX, PaymentMethod.TED].includes(
        createTransactionDto.paymentMethod,
      )
    ) {
      if (!createTransactionDto.accountId) {
        throw new BadRequestException('Conta é obrigatória para este método de pagamento');
      }
    }

    // Se for parcelado, criar múltiplas transações
    if (createTransactionDto.installments && createTransactionDto.installments > 1) {
      return this.createInstallmentTransactions(userId, createTransactionDto);
    }

    const transaction = this.buildTransactionEntity(userId, createTransactionDto);

    const savedTransaction = await this.transactionsRepository.save(transaction);

    // Atualizar saldo da conta se aplicável
    if (createTransactionDto.accountId) {
      await this.accountsService.updateBalance(
        createTransactionDto.accountId,
        createTransactionDto.amount,
        createTransactionDto.type,
      );
    }

    // Atualizar saldo do cartão se aplicável
    if (
      createTransactionDto.cardId &&
      createTransactionDto.paymentMethod === PaymentMethod.CREDIT
    ) {
      await this.updateCardBalance(createTransactionDto.cardId, createTransactionDto.amount);
    }

    return savedTransaction;
  }

  private async createInstallmentTransactions(
    userId: string,
    dto: CreateTransactionDto,
  ): Promise<Transaction> {
    const installments = dto.installments ?? 2;
    const installmentAmount = dto.amount / installments;
    const transactions: Transaction[] = [];

    for (let i = 0; i < installments; i++) {
      const installmentDate = new Date(dto.date);
      installmentDate.setMonth(installmentDate.getMonth() + i);

      const transaction = this.buildTransactionEntity(userId, dto, {
        amount: installmentAmount,
        date: installmentDate,
        currentInstallment: i + 1,
      });

      transactions.push(transaction);
    }

    const savedTransactions = await this.transactionsRepository.save(transactions);

    // Para cartão de crédito, atualizar saldo total
    if (dto.cardId && dto.paymentMethod === PaymentMethod.CREDIT) {
      await this.updateCardBalance(dto.cardId, dto.amount);
    }

    return savedTransactions[0]; // Retorna a primeira transação
  }

  async findAll(userId: string, queryDto: QueryTransactionDto) {
    const {
      startDate,
      endDate,
      type,
      paymentMethod,
      accountId,
      cardId,
      categoryId,
      page = 1,
      limit = 10,
      sortBy = 'date',
      sortOrder = 'DESC',
    } = queryDto;

    const where: FindOptionsWhere<Transaction> = {
      user: { id: userId },
    };

    if (type) where.type = type;
    if (paymentMethod) where.paymentMethod = paymentMethod;
    if (accountId) where.account = { id: accountId };
    if (cardId) where.card = { id: cardId };
    if (categoryId) where.category = { id: categoryId };

    if (startDate && endDate) {
      where.date = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      where.date = Between(new Date(startDate), new Date());
    }

    const [transactions, total] = await this.transactionsRepository.findAndCount({
      where,
      relations: ['account', 'card', 'category'],
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: transactions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findById(id: string, userId: string): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['account', 'card', 'category'],
    });

    if (!transaction) {
      throw new NotFoundException('Transação não encontrada');
    }

    return transaction;
  }

  async update(
    id: string,
    userId: string,
    updateTransactionDto: UpdateTransactionDto,
  ): Promise<Transaction> {
    const transaction = await this.findById(id, userId);

    // Reverter saldo anterior
    if (transaction.account) {
      await this.accountsService.updateBalance(
        transaction.account.id,
        -transaction.amount,
        transaction.type === TransactionType.INCOME
          ? TransactionType.EXPENSE
          : TransactionType.INCOME,
      );
    }

    // Atualizar transação
    Object.assign(transaction, updateTransactionDto);

    if (updateTransactionDto.categoryId) {
      transaction.category = { id: updateTransactionDto.categoryId } as Category;
    }

    const updatedTransaction = await this.transactionsRepository.save(transaction);

    // Aplicar novo saldo
    if (transaction.account) {
      await this.accountsService.updateBalance(
        transaction.account.id,
        transaction.amount,
        transaction.type,
      );
    }

    return updatedTransaction;
  }

  async remove(id: string, userId: string): Promise<void> {
    const transaction = await this.findById(id, userId);

    // Reverter saldo
    if (transaction.account) {
      await this.accountsService.updateBalance(
        transaction.account.id,
        -transaction.amount,
        transaction.type === TransactionType.INCOME
          ? TransactionType.EXPENSE
          : TransactionType.INCOME,
      );
    }

    if (transaction.card && transaction.paymentMethod === PaymentMethod.CREDIT) {
      await this.updateCardBalance(transaction.card.id, -transaction.amount);
    }

    await this.transactionsRepository.remove(transaction);
  }

  private buildTransactionEntity(
    userId: string,
    dto: CreateTransactionDto,
    overrides?: Partial<Pick<Transaction, 'amount' | 'date' | 'currentInstallment'>>,
  ): Transaction {
    return this.transactionsRepository.create({
      description: dto.description,
      amount: overrides?.amount ?? dto.amount,
      type: dto.type,
      paymentMethod: dto.paymentMethod,
      date: overrides?.date ?? new Date(dto.date),
      isRecurring: dto.isRecurring ?? false,
      installments: dto.installments,
      currentInstallment: overrides?.currentInstallment,
      user: { id: userId },
      account: dto.accountId ? { id: dto.accountId } : undefined,
      card: dto.cardId ? { id: dto.cardId } : undefined,
      category: { id: dto.categoryId },
    });
  }

  private async updateCardBalance(cardId: string, amount: number): Promise<void> {
    await this.cardsService.updateCurrentBalance(cardId, amount);
  }

  async getMonthlySummary(userId: string, year: number, month?: number) {
    const queryBuilder = this.transactionsRepository
      .createQueryBuilder('transaction')
      .where('transaction.userId = :userId', { userId });

    if (month) {
      queryBuilder.andWhere('EXTRACT(MONTH FROM transaction.date) = :month', { month });
    }

    if (year) {
      queryBuilder.andWhere('EXTRACT(YEAR FROM transaction.date) = :year', { year });
    }

    const result = await queryBuilder
      .select('transaction.type', 'type')
      .addSelect('SUM(transaction.amount)', 'total')
      .addSelect('COUNT(transaction.id)', 'count')
      .groupBy('transaction.type')
      .getRawMany();

    const income = result.find(r => r.type === TransactionType.INCOME);
    const expense = result.find(r => r.type === TransactionType.EXPENSE);
    const transfer = result.find(r => r.type === TransactionType.TRANSFER);

    return {
      income: {
        total: Number(income?.total || 0),
        count: Number(income?.count || 0),
      },
      expense: {
        total: Number(expense?.total || 0),
        count: Number(expense?.count || 0),
      },
      transfer: {
        total: Number(transfer?.total || 0),
        count: Number(transfer?.count || 0),
      },
      balance: Number(income?.total || 0) - Number(expense?.total || 0),
    };
  }
}
