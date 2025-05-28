import { ApiProperty } from '@nestjs/swagger';

export class SummaryDto {
  @ApiProperty({ description: 'Total de fazendas cadastradas', example: 10 })
  totalFarms: number;

  @ApiProperty({
    description: 'Soma total da área em hectares',
    example: 1234.5,
  })
  totalArea: number;
}
