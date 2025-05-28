import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateProducerDto {
  @ApiProperty({
    description: 'CPF ou CNPJ do produtor',
    example: '12345678901',
  })
  @IsNotEmpty()
  @IsString()
  @Length(11, 14)
  document: string;

  @ApiProperty({
    description: 'Nome completo do produtor',
    example: 'João Silva',
  })
  @IsNotEmpty()
  @IsString()
  name: string;
}
