import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CategoriesService } from '../categories/categories.service';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private categoriesService: CategoriesService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);

    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    const user = await this.usersService.create(registerDto);
    await this.categoriesService.createDefaultCategories(user.id);

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    };
  }

  private generateToken(user: Pick<User, 'id' | 'email' | 'name'>): string {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };

    return this.jwtService.sign(payload);
  }

  async validateUser(userId: string) {
    return this.usersService.findById(userId);
  }
}
