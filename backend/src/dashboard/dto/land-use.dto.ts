import { ApiProperty } from '@nestjs/swagger';

export class LandUseDto {
  @ApiProperty({ description: 'Total de hectares agricultáveis', example: 800 })
  arable: number;

  @ApiProperty({ description: 'Total de hectares vegetação', example: 400 })
  vegetation: number;
}
