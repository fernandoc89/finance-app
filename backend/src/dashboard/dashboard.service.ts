import { Injectable } from '@nestjs/common';
import { AccountsService } from '../accounts/accounts.service';
import { CardsService } from '../cards/cards.service';
import { CategoriesService } from '../categories/categories.service';
import { TransactionsService } from '../transactions/transactions.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class DashboardService {
  constructor(
    private transactionsService: TransactionsService,
    private accountsService: AccountsService,
    private cardsService: CardsService,
    private categoriesService: CategoriesService,
    private usersService: UsersService,
  ) { }

  async getDashboardData(userId: string) {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const [
      financialSummary,
      monthlySummary,
      recentTransactions,
      accounts,
      cardsSummary,
      categoryStats,
    ] = await Promise.all([
      this.usersService.getFinancialSummary(userId),
      this.transactionsService.getMonthlySummary(userId, currentYear, currentMonth),
      this.transactionsService.findAll(userId, {
        page: 1,
        limit: 5,
        sortBy: 'date',
        sortOrder: 'DESC',
      }),
      this.accountsService.findAllByUser(userId),
      this.cardsService.getCardsSummary(userId),
      this.categoriesService.getCategoryStats(
        userId,
        new Date(currentYear, currentMonth - 1, 1),
        new Date(currentYear, currentMonth, 0),
      ),
    ]);

    return {
      totalBalance: financialSummary.totalBalance,
      monthlyIncome: monthlySummary.income.total,
      monthlyExpenses: monthlySummary.expense.total,
      monthlyBalance: monthlySummary.balance,
      accounts,
      cards: cardsSummary,
      recentTransactions: recentTransactions.data,
      expensesByCategory: categoryStats.filter(cat => cat.total > 0),
      financialSummary,
    };
  }

  async getMonthlyBalanceHistory(userId: string, months: number = 12) {
    const history: Array<{
      month: string;
      income: number;
      expense: number;
      balance: number;
    }> = [];
    const currentDate = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      const summary = await this.transactionsService.getMonthlySummary(
        userId,
        year,
        month,
      );

      history.push({
        month: date.toLocaleString('pt-BR', { month: 'short', year: 'numeric' }),
        income: summary.income.total,
        expense: summary.expense.total,
        balance: summary.balance,
      });
    }

    return history;
  }
}
