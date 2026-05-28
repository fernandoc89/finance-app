import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { AccountType } from '../entities/account.entity';

export class CreateAccountDto {
  @ApiProperty({ example: 'Conta Corrente Nubank' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ enum: AccountType, example: AccountType.CHECKING })
  @IsEnum(AccountType)
  type: AccountType;

  @ApiProperty({ example: 1500.00 })
  @IsNumber()
  @Min(0)
  balance: number;

  @ApiProperty({ example: 'Nubank' })
  @IsString()
  @MaxLength(50)
  bank: string;

  @ApiPropertyOptional({ example: '#820AD1' })
  @IsString()
  @IsOptional()
  color?: string;
}
