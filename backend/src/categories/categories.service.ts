import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Transaction,
  TransactionType,
} from '../transactions/entities/transaction.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
  ) { }

  async create(
    userId: string,
    createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    // Verificar se já existe categoria com o mesmo nome
    const existingCategory = await this.categoriesRepository.findOne({
      where: {
        user: { id: userId },
        name: createCategoryDto.name,
      },
    });

    if (existingCategory) {
      throw new BadRequestException('Já existe uma categoria com este nome');
    }

    const category = this.categoriesRepository.create({
      ...createCategoryDto,
      user: { id: userId },
    });

    return this.categoriesRepository.save(category);
  }

  async createDefaultCategories(userId: string): Promise<Category[]> {
    const defaultCategories = [
      { name: 'Alimentação', icon: 'restaurant', color: '#FF6B6B' },
      { name: 'Transporte', icon: 'directions-car', color: '#4ECDC4' },
      { name: 'Moradia', icon: 'home', color: '#45B7D1' },
      { name: 'Saúde', icon: 'local-hospital', color: '#96CEB4' },
      { name: 'Educação', icon: 'school', color: '#FFEAA7' },
      { name: 'Lazer', icon: 'movie', color: '#DDA0DD' },
      { name: 'Compras', icon: 'shopping-cart', color: '#98D8C8' },
      { name: 'Assinaturas', icon: 'subscriptions', color: '#F7DC6F' },
      { name: 'Salário', icon: 'work', color: '#82E0AA' },
      { name: 'Freelance', icon: 'laptop', color: '#85C1E9' },
      { name: 'Investimentos', icon: 'trending-up', color: '#BB8FCE' },
      { name: 'Outros', icon: 'more-horiz', color: '#F0B27A' },
    ];

    const categories = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/await-thenable
      defaultCategories.map((cat) =>
        this.categoriesRepository.create({
          ...cat,
          user: { id: userId },
        }),
      ),
    );

    return this.categoriesRepository.save(categories);
  }

  async findAllByUser(userId: string): Promise<Category[]> {
    return this.categoriesRepository.find({
      where: { user: { id: userId } },
      order: { name: 'ASC' },
    });
  }

  async findById(id: string, userId: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['transactions'],
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return category;
  }

  async update(
    id: string,
    userId: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findById(id, userId);

    Object.assign(category, updateCategoryDto);
    return this.categoriesRepository.save(category);
  }

  async remove(id: string, userId: string): Promise<void> {
    const category = await this.findById(id, userId);

    // Verificar transações vinculadas
    const transactionCount = await this.transactionsRepository.count({
      where: { category: { id } },
    });

    if (transactionCount > 0) {
      // Soft delete - apenas desativar
      category.isActive = false;
      await this.categoriesRepository.save(category);
    } else {
      // Hard delete - remover permanentemente
      await this.categoriesRepository.remove(category);
    }
  }

  async getCategoryStats(userId: string, startDate?: Date, endDate?: Date) {
    const categories = await this.categoriesRepository.find({
      where: { user: { id: userId }, isActive: true },
    });

    const stats = await Promise.all(
      categories.map(async (category) => {
        const queryBuilder = this.transactionsRepository
          .createQueryBuilder('transaction')
          .where('transaction.categoryId = :categoryId', {
            categoryId: category.id,
          })
          .andWhere('transaction.type = :type', {
            type: TransactionType.EXPENSE,
          });

        if (startDate) {
          queryBuilder.andWhere('transaction.date >= :startDate', {
            startDate,
          });
        }
        if (endDate) {
          queryBuilder.andWhere('transaction.date <= :endDate', {
            endDate,
          });
        }

        const total = (await queryBuilder
          .select('SUM(transaction.amount)', 'total')
          .getRawOne()) as { total: string };

        const count = await queryBuilder.getCount();

        return {
          category: {
            id: category.id,
            name: category.name,
            icon: category.icon,
            color: category.color,
          },
          total: Number(total.total ?? 0),
          transactionCount: count,
          percentage: 0, // Será calculado depois
        };
      }),
    );

    const totalExpenses = stats.reduce((sum, stat) => sum + stat.total, 0);

    return stats.map((stat) => ({
      ...stat,
      percentage: totalExpenses > 0 ? (stat.total / totalExpenses) * 100 : 0,
    }));
  }
}
