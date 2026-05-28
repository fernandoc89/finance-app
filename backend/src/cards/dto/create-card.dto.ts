import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { CardFlag } from '../entities/card.entity';

export class CreateCardDto {
  @ApiProperty({ example: 'Cartão Nubank' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ enum: CardFlag, example: CardFlag.MASTERCARD })
  @IsEnum(CardFlag)
  flag: CardFlag;

  @ApiProperty({ example: '1234' })
  @IsString()
  @MaxLength(4)
  lastDigits: string;

  @ApiProperty({ example: 5000.00 })
  @IsNumber()
  @Min(0)
  limit: number;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(1)
  @Max(31)
  closingDay: number;

  @ApiProperty({ example: 15 })
  @IsInt()
  @Min(1)
  @Max(31)
  dueDay: number;

  @ApiProperty({ example: '#820AD1', required: false })
  @IsString()
  @IsOptional()
  color?: string;
}
