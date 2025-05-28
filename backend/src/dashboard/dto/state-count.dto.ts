import { ApiProperty } from '@nestjs/swagger';

export class StateCountDto {
  @ApiProperty({ description: 'Estado (sigla)', example: 'SP' })
  state: string;

  @ApiProperty({
    description: 'Quantidade de fazendas neste estado',
    example: 4,
  })
  count: number;
}
