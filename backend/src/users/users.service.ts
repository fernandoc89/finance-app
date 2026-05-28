import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.usersRepository.save(user);
  }

  async findAll(): Promise<Partial<User>[]> {
    const users = await this.usersRepository.find({
      select: ['id', 'name', 'email', 'createdAt', 'updatedAt'],
    });

    return users;
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['accounts', 'cards', 'categories'],
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    return this.sanitizeUser(user);
  }

  async findByIdForUser(id: string, userId: string): Promise<User> {
    if (id !== userId) {
      throw new ForbiddenException('Acesso negado a este recurso');
    }

    return this.findById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      select: ['id', 'name', 'email', 'password', 'createdAt', 'updatedAt'],
    });
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'name', 'email', 'password', 'createdAt', 'updatedAt'],
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Senha atual incorreta');
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(changePasswordDto.newPassword, salt);
    const saved = await this.usersRepository.save(user);

    return this.sanitizeUser(saved);
  }

  async update(id: string, userId: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (id !== userId) {
      throw new ForbiddenException('Acesso negado a este recurso');
    }

    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(updateUserDto.password, salt);
      delete updateUserDto.password;
    }

    Object.assign(user, updateUserDto);
    const saved = await this.usersRepository.save(user);

    return this.sanitizeUser(saved);
  }

  async remove(id: string, userId: string): Promise<void> {
    if (id !== userId) {
      throw new ForbiddenException('Acesso negado a este recurso');
    }

    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    await this.usersRepository.remove(user);
  }

  async getFinancialSummary(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['accounts', 'cards'],
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const totalBalance = user.accounts.reduce(
      (sum, account) => sum + Number(account.balance),
      0,
    );

    const totalCreditUsed = user.cards.reduce(
      (sum, card) => sum + Number(card.currentBalance),
      0,
    );

    const totalCreditLimit = user.cards.reduce(
      (sum, card) => sum + Number(card.limit),
      0,
    );

    return {
      totalBalance,
      totalCreditUsed,
      totalCreditLimit,
      availableCredit: totalCreditLimit - totalCreditUsed,
      accountsCount: user.accounts.length,
      cardsCount: user.cards.length,
    };
  }

  private sanitizeUser(user: User): User {
    const { password: _password, ...sanitized } = user;
    return sanitized as User;
  }
}
