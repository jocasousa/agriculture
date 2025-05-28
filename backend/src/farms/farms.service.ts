import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFarmDto } from './dto/create-farm.dto';
import { UpdateFarmDto } from './dto/update-farm.dto';
import { Farm } from './entities/farm.entity';
import { Producer } from '../producers/entities/producer.entity';

@Injectable()
export class FarmsService {
  constructor(
    @InjectRepository(Farm)
    private readonly farmRepo: Repository<Farm>,
    @InjectRepository(Producer)
    private readonly producerRepo: Repository<Producer>,
  ) {}

  async create(dto: CreateFarmDto): Promise<Farm> {
    // valida soma de áreas
    if (dto.arableArea + dto.vegetationArea > dto.totalArea) {
      throw new BadRequestException('Parcela excede área total');
    }
    // busca produtor
    const producer = await this.producerRepo.findOne({
      where: { id: dto.producerId },
    });
    if (!producer) throw new NotFoundException('Produtor não encontrado');

    const farm = this.farmRepo.create({
      name: dto.name,
      city: dto.city,
      state: dto.state,
      totalArea: dto.totalArea,
      arableArea: dto.arableArea,
      vegetationArea: dto.vegetationArea,
      producer,
    });
    return this.farmRepo.save(farm);
  }

  findAll(): Promise<Farm[]> {
    return this.farmRepo.find({ relations: ['producer'] });
  }
  async findByProducerId(producerId: string): Promise<Farm[]> {
    // Busca fazendas onde producer.id === producerId
    return this.farmRepo.find({
      where: { producer: { id: producerId } },
      relations: ['producer'],
    });
  }

  async findOne(id: string): Promise<Farm> {
    const farm = await this.farmRepo.findOne({
      where: { id },
      relations: ['producer'],
    });
    if (!farm) throw new NotFoundException('Fazenda não encontrada');
    return farm;
  }

  async update(id: string, dto: UpdateFarmDto): Promise<Farm> {
    const farm = await this.findOne(id);

    // se vier producerId, troque a relação
    if (dto.producerId) {
      const prod = await this.producerRepo.findOne({
        where: { id: dto.producerId },
      });
      if (!prod) throw new NotFoundException('Produtor não encontrado');
      farm.producer = prod;
    }

    Object.assign(farm, dto);
    if (farm.arableArea + farm.vegetationArea > farm.totalArea) {
      throw new BadRequestException('Parcela excede área total');
    }

    return this.farmRepo.save(farm);
  }

  async remove(id: string): Promise<void> {
    const res = await this.farmRepo.delete(id);
    if (!res.affected) throw new NotFoundException('Fazenda não encontrada');
  }
}
