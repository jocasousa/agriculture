import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class CreateSeasonDto {
  @ApiProperty({ description: 'Ano da safra', example: 2023 })
  @IsNumber()
  @Min(2000)
  year: number;
}
