import { ApiProperty } from '@nestjs/swagger';

export class CropCountDto {
  @ApiProperty({ description: 'Nome da cultura', example: 'Soja' })
  crop: string;

  @ApiProperty({ description: 'Número de registros de plantio', example: 7 })
  count: number;
}
