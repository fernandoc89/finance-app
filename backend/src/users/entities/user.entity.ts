import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Account } from '../../accounts/entities/account.entity';
import { Card } from '../../cards/entities/card.entity';
import { Category } from '../../categories/entities/category.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @OneToMany(() => Account, account => account.user)
  accounts: Account[];

  @OneToMany(() => Card, card => card.user)
  cards: Card[];

  @OneToMany(() => Transaction, transaction => transaction.user)
  transactions: Transaction[];

  @OneToMany(() => Category, category => category.user)
  categories: Category[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
