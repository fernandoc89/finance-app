import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Alimentação' })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({ example: 'restaurant' })
  @IsString()
  @MaxLength(50)
  icon: string;

  @ApiProperty({ example: '#FF6B6B' })
  @IsString()
  @MaxLength(7)
  color: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  isActive?: boolean;
}
