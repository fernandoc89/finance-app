import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { User } from '../../users/entities/user.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  icon: string;

  @Column()
  color: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => User, user => user.categories)
  user: User;

  @OneToMany(() => Transaction, transaction => transaction.category)
  transactions: Transaction[];

  @CreateDateColumn()
  createdAt: Date;
}
