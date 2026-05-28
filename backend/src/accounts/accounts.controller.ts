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
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@ApiTags('Contas')
@ApiBearerAuth()
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova conta' })
  @ApiResponse({ status: 201, description: 'Conta criada com sucesso' })
  create(@Request() req: { user: { id: string } }, @Body() createAccountDto: CreateAccountDto) {
    return this.accountsService.create(req.user.id, createAccountDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as contas do usuário' })
  findAll(@Request() req: { user: { id: string } }) {
    return this.accountsService.findAllByUser(req.user.id);
  }

  @Get(':id/balance-history')
  @ApiOperation({ summary: 'Obter histórico de saldo da conta' })
  @ApiQuery({ name: 'startDate', required: true, example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', required: true, example: '2024-01-31' })
  getBalanceHistory(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.accountsService.getBalanceHistory(
      id,
      req.user.id,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar conta por ID' })
  findOne(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.accountsService.findById(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar conta' })
  update(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return this.accountsService.update(id, req.user.id, updateAccountDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover conta' })
  remove(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.accountsService.remove(id, req.user.id);
  }
}
