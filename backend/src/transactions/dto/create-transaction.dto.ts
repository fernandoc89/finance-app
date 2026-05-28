import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';
import { PaymentMethod, TransactionType } from '../entities/transaction.entity';

export class CreateTransactionDto {
  @ApiProperty({ example: 'Supermercado' })
  @IsString()
  @MaxLength(200)
  description: string;

  @ApiProperty({ example: 150.75 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ enum: TransactionType, example: TransactionType.EXPENSE })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CREDIT })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: false, default: false })
  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(48)
  installments?: number;

  @ApiPropertyOptional({ example: 'uuid-da-conta' })
  @IsUUID()
  @IsOptional()
  accountId?: string;

  @ApiPropertyOptional({ example: 'uuid-do-cartao' })
  @IsUUID()
  @IsOptional()
  cardId?: string;

  @ApiProperty({ example: 'uuid-da-categoria' })
  @IsUUID()
  categoryId: string;
}
