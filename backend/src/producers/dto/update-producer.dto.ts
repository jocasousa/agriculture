import { PartialType } from '@nestjs/mapped-types';
import { CreateProducerDto } from './create-producer.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProducerDto extends PartialType(CreateProducerDto) {
  @ApiPropertyOptional({ description: 'Novo CPF/CNPJ', example: '10987654321' })
  document?: string;

  @ApiPropertyOptional({
    description: 'Novo nome do produtor',
    example: 'Maria Souza',
  })
  name?: string;
}
