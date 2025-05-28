// src/seasons/dto/update-season.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateSeasonDto } from './create-season.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSeasonDto extends PartialType(CreateSeasonDto) {
  @ApiPropertyOptional({ example: 2024 })
  year?: number;
}
