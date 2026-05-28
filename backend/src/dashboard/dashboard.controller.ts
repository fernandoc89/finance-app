import { Controller, Get, Query, Request } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  @Get()
  @ApiOperation({ summary: 'Obter dados do dashboard' })
  getDashboard(@Request() req) {
    return this.dashboardService.getDashboardData(req.user.id);
  }

  @Get('balance-history')
  @ApiOperation({ summary: 'Obter histórico de balanço mensal' })
  @ApiQuery({ name: 'months', required: false, example: 12 })
  getBalanceHistory(
    @Request() req,
    @Query('months') months?: number,
  ) {
    return this.dashboardService.getMonthlyBalanceHistory(
      req.user.id,
      months || 12,
    );
  }
}
