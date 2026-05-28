import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Account } from '../../accounts/entities/account.entity';
import { Card } from '../../cards/entities/card.entity';
import { Category } from '../../categories/entities/category.entity';
import { User } from '../../users/entities/user.entity';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer',
}

export enum PaymentMethod {
  PIX = 'pix',
  DEBIT = 'debit',
  CREDIT = 'credit',
  MONEY = 'money',
  TED = 'ted',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.PIX,
  })
  paymentMethod: PaymentMethod;

  @Column()
  date: Date;

  @Column({ default: false })
  isRecurring: boolean;

  @Column({ nullable: true })
  installments: number;

  @Column({ nullable: true })
  currentInstallment: number;

  @ManyToOne(() => User, user => user.transactions)
  user: User;

  @ManyToOne(() => Account, account => account.transactions, { nullable: true })
  account: Account;

  @ManyToOne(() => Card, card => card.transactions, { nullable: true })
  card: Card;

  @ManyToOne(() => Category, category => category.transactions)
  category: Category;

  @CreateDateColumn()
  createdAt: Date;
}
