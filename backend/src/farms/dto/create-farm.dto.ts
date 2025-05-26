import { IsNotEmpty, IsUUID, IsNumber, Min } from 'class-validator';

export class CreateFarmDto {
  @IsNotEmpty() name: string;
  @IsNotEmpty() city: string;
  @IsNotEmpty() state: string;

  @IsNumber() @Min(0) totalArea: number;
  @IsNumber() @Min(0) arableArea: number;
  @IsNumber() @Min(0) vegetationArea: number;

  @IsUUID() @IsNotEmpty() producerId: string;
}
