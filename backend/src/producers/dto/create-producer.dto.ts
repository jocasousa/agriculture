import { IsNotEmpty, Matches } from 'class-validator';

export class CreateProducerDto {
  @IsNotEmpty()
  @Matches(/^\d{11}$|^\d{14}$/, {
    message: 'CPF (11 dígitos) ou CNPJ (14 dígitos)',
  })
  document: string;

  @IsNotEmpty()
  name: string;
}
