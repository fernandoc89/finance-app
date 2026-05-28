import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@ApiTags('Cartões')
@ApiBearerAuth()
@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo cartão' })
  @ApiResponse({ status: 201, description: 'Cartão criado com sucesso' })
  create(@Request() req: { user: { id: string } }, @Body() createCardDto: CreateCardDto) {
    return this.cardsService.create(req.user.id, createCardDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os cartões do usuário' })
  findAll(@Request() req: { user: { id: string } }) {
    return this.cardsService.findAllByUser(req.user.id);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Obter resumo dos cartões' })
  getSummary(@Request() req: { user: { id: string } }) {
    return this.cardsService.getCardsSummary(req.user.id);
  }

  @Get(':id/invoice')
  @ApiOperation({ summary: 'Obter fatura do cartão' })
  @ApiQuery({ name: 'month', required: true, example: 1 })
  @ApiQuery({ name: 'year', required: true, example: 2024 })
  getInvoice(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Query('month') month: number,
    @Query('year') year: number,
  ) {
    return this.cardsService.getInvoice(id, req.user.id, month, year);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar cartão por ID' })
  findOne(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.cardsService.findById(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar cartão' })
  update(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() updateCardDto: UpdateCardDto,
  ) {
    return this.cardsService.update(id, req.user.id, updateCardDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover cartão' })
  remove(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.cardsService.remove(id, req.user.id);
  }
}
