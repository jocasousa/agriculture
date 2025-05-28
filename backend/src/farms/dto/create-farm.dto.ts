import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, IsNumber, Min } from 'class-validator';

export class CreateFarmDto {
  @ApiProperty({ description: 'Nome da fazenda', example: 'Fazenda Primavera' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Cidade da fazenda', example: 'Campinas' })
  @IsString()
  city: string;

  @ApiProperty({ description: 'Estado da fazenda (sigla)', example: 'SP' })
  @IsString()
  state: string;

  @ApiProperty({ description: 'Área total em hectares', example: 100 })
  @IsNumber()
  @Min(0)
  totalArea: number;

  @ApiProperty({ description: 'Área agricultável em hectares', example: 60 })
  @IsNumber()
  @Min(0)
  arableArea: number;

  @ApiProperty({ description: 'Área de vegetação em hectares', example: 40 })
  @IsNumber()
  @Min(0)
  vegetationArea: number;

  @ApiProperty({
    description: 'ID do produtor responsável',
    example: 'uuid-do-produtor',
  })
  @IsUUID()
  producerId: string;
}
