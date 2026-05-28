import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { User } from '../../users/entities/user.entity';

export enum AccountType {
  CHECKING = 'checking',
  SAVINGS = 'savings',
  INVESTMENT = 'investment',
}

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: AccountType,
    default: AccountType.CHECKING,
  })
  type: AccountType;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  balance: number;

  @Column()
  bank: string;

  @Column({ nullable: true })
  color: string;

  @ManyToOne(() => User, user => user.accounts)
  user: User;

  @OneToMany(() => Transaction, transaction => transaction.account)
  transactions: Transaction[];

  @CreateDateColumn()
  createdAt: Date;
}
