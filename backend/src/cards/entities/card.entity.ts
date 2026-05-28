import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { User } from '../../users/entities/user.entity';

export enum CardFlag {
  VISA = 'visa',
  MASTERCARD = 'mastercard',
  ELO = 'elo',
  AMEX = 'amex',
}

@Entity('cards')
export class Card {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: CardFlag,
  })
  flag: CardFlag;

  @Column()
  lastDigits: string;

  @Column('decimal', { precision: 10, scale: 2 })
  limit: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  currentBalance: number;

  @Column()
  closingDay: number;

  @Column()
  dueDay: number;

  @Column({ nullable: true })
  color: string;

  @ManyToOne(() => User, user => user.cards)
  user: User;

  @OneToMany(() => Transaction, transaction => transaction.card)
  transactions: Transaction[];

  @CreateDateColumn()
  createdAt: Date;
}
