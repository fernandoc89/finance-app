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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionsService } from './transactions.service';

@ApiTags('Transações')
@ApiBearerAuth()
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) { }

  @Post()
  @ApiOperation({ summary: 'Criar nova transação' })
  @ApiResponse({ status: 201, description: 'Transação criada com sucesso' })
  create(
    @Request() req: { user: { id: string } },
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    return this.transactionsService.create(req.user.id, createTransactionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar transações com filtros e paginação' })
  findAll(
    @Request() req: { user: { id: string } },
    @Query() queryDto: QueryTransactionDto,
  ) {
    return this.transactionsService.findAll(req.user.id, queryDto);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Obter resumo mensal' })
  @ApiQuery({ name: 'year', required: true, example: 2024 })
  @ApiQuery({ name: 'month', required: false, example: 1 })
  getMonthlySummary(
    @Request() req: { user: { id: string } },
    @Query('year') year: number,
    @Query('month') month?: number,
  ) {
    return this.transactionsService.getMonthlySummary(req.user.id, year, month);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar transação por ID' })
  findOne(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.transactionsService.findById(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar transação' })
  update(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(
      id,
      req.user.id,
      updateTransactionDto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover transação' })
  remove(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.transactionsService.remove(id, req.user.id);
  }
}
