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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('Categorias')
@ApiBearerAuth()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova categoria' })
  @ApiResponse({ status: 201, description: 'Categoria criada com sucesso' })
  create(
    @Request() req: { user: { id: string } },
    @Body() createCategoryDto: CreateCategoryDto,
  ) {
    return this.categoriesService.create(req.user.id, createCategoryDto);
  }

  @Post('defaults')
  @ApiOperation({ summary: 'Criar categorias padrão' })
  @ApiResponse({ status: 201, description: 'Categorias padrão criadas com sucesso' })
  createDefaults(@Request() req: { user: { id: string } }) {
    return this.categoriesService.createDefaultCategories(req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as categorias do usuário' })
  findAll(@Request() req: { user: { id: string } }) {
    return this.categoriesService.findAllByUser(req.user.id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obter estatísticas por categoria' })
  @ApiQuery({ name: 'startDate', required: false, example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', required: false, example: '2024-01-31' })
  getStats(
    @Request() req: { user: { id: string } },
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.categoriesService.getCategoryStats(
      req.user.id,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar categoria por ID' })
  findOne(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.categoriesService.findById(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar categoria' })
  update(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, req.user.id, updateCategoryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover/Desativar categoria' })
  remove(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.categoriesService.remove(id, req.user.id);
  }
}
