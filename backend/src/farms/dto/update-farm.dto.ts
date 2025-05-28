import { PartialType } from '@nestjs/mapped-types';
import { CreateFarmDto } from './create-farm.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFarmDto extends PartialType(CreateFarmDto) {
  @ApiPropertyOptional({ example: 'Nova Cidade' })
  city?: string;

  @ApiPropertyOptional({ example: 'RJ' })
  state?: string;

  @ApiPropertyOptional({ example: 120 })
  totalArea?: number;

  @ApiPropertyOptional({ example: 70 })
  arableArea?: number;

  @ApiPropertyOptional({ example: 50 })
  vegetationArea?: number;
}
