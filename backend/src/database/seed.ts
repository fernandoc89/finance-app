import { NestFactory } from '@nestjs/core';
import { AccountsService } from '../accounts/accounts.service';
import { AccountType } from '../accounts/entities/account.entity';
import { AppModule } from '../app.module';
import { CardsService } from '../cards/cards.service';
import { CardFlag } from '../cards/entities/card.entity';
import { CategoriesService } from '../categories/categories.service';
import { UsersService } from '../users/users.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const usersService = app.get(UsersService);
  const categoriesService = app.get(CategoriesService);
  const accountsService = app.get(AccountsService);
  const cardsService = app.get(CardsService);

  try {
    // Criar usuário de teste
    const user = await usersService.create({
      name: 'Usuário Teste',
      email: 'teste@email.com',
      password: '123456',
    });

    console.log('✅ Usuário criado:', user.email);

    // Criar categorias padrão
    const categories = await categoriesService.createDefaultCategories(user.id);
    console.log('✅ Categorias criadas:', categories.length);

    // Criar contas
    await accountsService.create(user.id, {
      name: 'Conta Corrente',
      type: AccountType.CHECKING,
      balance: 5000,
      bank: 'Nubank',
      color: '#820AD1',
    });

    await accountsService.create(user.id, {
      name: 'Poupança',
      type: AccountType.SAVINGS,
      balance: 10000,
      bank: 'Itaú',
      color: '#EC7000',
    });

    console.log('✅ Contas criadas');

    // Criar cartões
    await cardsService.create(user.id, {
      name: 'Nubank',
      flag: CardFlag.MASTERCARD,
      lastDigits: '1234',
      limit: 5000,
      closingDay: 10,
      dueDay: 15,
      color: '#820AD1',
    });

    await cardsService.create(user.id, {
      name: 'Inter',
      flag: CardFlag.VISA,
      lastDigits: '5678',
      limit: 3000,
      closingDay: 1,
      dueDay: 7,
      color: '#FF7A00',
    });

    console.log('✅ Cartões criados');
    console.log('\n🎉 Seed concluído com sucesso!');
    console.log('📧 Email: teste@email.com');
    console.log('🔑 Senha: 123456');
  } catch (error) {
    console.error('❌ Erro ao executar seed:', (error as Error).message);
  } finally {
    await app.close();
  }
}

bootstrap();
