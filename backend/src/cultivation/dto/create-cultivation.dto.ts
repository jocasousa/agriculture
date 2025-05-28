import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateCultivationDto {
  @ApiProperty({ description: 'Nome da cultura', example: 'Soja' })
  @IsNotEmpty()
  @IsString()
  crop: string;

  @ApiProperty({ description: 'ID da fazenda', example: 'uuid-da-fazenda' })
  @IsUUID()
  farmId: string;

  @ApiProperty({ description: 'ID da safra', example: 'uuid-da-safra' })
  @IsUUID()
  seasonId: string;
}
