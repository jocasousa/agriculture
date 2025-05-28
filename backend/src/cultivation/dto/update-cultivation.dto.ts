import { PartialType } from '@nestjs/mapped-types';
import { CreateCultivationDto } from './create-cultivation.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCultivationDto extends PartialType(CreateCultivationDto) {
  @ApiPropertyOptional({ example: 'Milho' })
  crop?: string;

  @ApiPropertyOptional({ example: 'uuid-nova-fazenda' })
  farmId?: string;

  @ApiPropertyOptional({ example: 'uuid-nova-safra' })
  seasonId?: string;
}
