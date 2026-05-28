import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { Card } from './entities/card.entity';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private cardsRepository: Repository<Card>,
  ) { }

  async create(userId: string, createCardDto: CreateCardDto): Promise<Card> {
    // Verificar se já existe cartão com os mesmos últimos dígitos para o usuário
    const existingCard = await this.cardsRepository.findOne({
      where: {
        user: { id: userId },
        lastDigits: createCardDto.lastDigits,
      },
    });

    if (existingCard) {
      throw new BadRequestException('Já existe um cartão com esses dígitos finais');
    }

    const card = this.cardsRepository.create({
      ...createCardDto,
      currentBalance: 0,
      user: { id: userId },
    });

    return this.cardsRepository.save(card);
  }

  async findAllByUser(userId: string): Promise<Card[]> {
    return this.cardsRepository.find({
      where: { user: { id: userId } },
      order: { name: 'ASC' },
    });
  }

  async findById(id: string, userId: string): Promise<Card> {
    const card = await this.cardsRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['transactions', 'transactions.category'],
    });

    if (!card) {
      throw new NotFoundException('Cartão não encontrado');
    }

    return card;
  }

  async update(id: string, userId: string, updateCardDto: UpdateCardDto): Promise<Card> {
    const card = await this.findById(id, userId);

    Object.assign(card, updateCardDto);
    return this.cardsRepository.save(card);
  }

  async remove(id: string, userId: string): Promise<void> {
    const card = await this.findById(id, userId);

    // Verificar se há transações pendentes
    if (card.currentBalance > 0) {
      throw new BadRequestException(
        'Não é possível remover um cartão com fatura em aberto',
      );
    }

    await this.cardsRepository.remove(card);
  }

  async getInvoice(cardId: string, userId: string, month: number, year: number) {
    const card = await this.findById(cardId, userId);

    const startDate = new Date(year, month - 1, card.closingDay + 1);
    const endDate = new Date(year, month, card.closingDay);

    const transactions = card.transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });

    const totalAmount = transactions.reduce(
      (sum, transaction) => sum + Number(transaction.amount),
      0,
    );

    return {
      card: {
        id: card.id,
        name: card.name,
        flag: card.flag,
        lastDigits: card.lastDigits,
      },
      period: {
        start: startDate,
        end: endDate,
        closingDay: card.closingDay,
        dueDay: card.dueDay,
        dueDate: new Date(year, month, card.dueDay),
      },
      transactions,
      totalAmount,
      transactionCount: transactions.length,
    };
  }

  async updateCurrentBalance(cardId: string, amountDelta: number): Promise<void> {
    const card = await this.cardsRepository.findOne({
      where: { id: cardId },
    });

    if (!card) {
      throw new NotFoundException('Cartão não encontrado');
    }

    const newBalance = Number(card.currentBalance) + Number(amountDelta);

    if (newBalance > Number(card.limit)) {
      throw new BadRequestException('Limite do cartão excedido');
    }

    if (newBalance < 0) {
      throw new BadRequestException('Saldo do cartão não pode ser negativo');
    }

    card.currentBalance = newBalance;
    await this.cardsRepository.save(card);
  }

  async getCardsSummary(userId: string) {
    const cards = await this.findAllByUser(userId);

    const totalLimit = cards.reduce((sum, card) => sum + Number(card.limit), 0);
    const totalUsed = cards.reduce((sum, card) => sum + Number(card.currentBalance), 0);

    return {
      cards,
      totalLimit,
      totalUsed,
      availableCredit: totalLimit - totalUsed,
      utilizationRate: totalLimit > 0 ? (totalUsed / totalLimit) * 100 : 0,
    };
  }
}
