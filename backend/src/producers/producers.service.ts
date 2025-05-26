import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProducerDto } from './dto/create-producer.dto';
import { UpdateProducerDto } from './dto/update-producer.dto';
import { Producer } from './entities/producer.entity';

@Injectable()
export class ProducersService {
  constructor(
    @InjectRepository(Producer)
    private readonly repo: Repository<Producer>,
  ) {}

  async create(dto: CreateProducerDto): Promise<Producer> {
    const exists = await this.repo.findOne({
      where: { document: dto.document },
    });
    if (exists) throw new BadRequestException('Documento já cadastrado');
    const prod = this.repo.create(dto);
    return this.repo.save(prod);
  }

  findAll(): Promise<Producer[]> {
    return this.repo.find();
  }

  async findOne(id: string): Promise<Producer> {
    const prod = await this.repo.findOne({
      where: { id },
    });
    if (!prod) throw new NotFoundException('Produtor não encontrado');
    return prod;
  }

  async update(id: string, dto: UpdateProducerDto): Promise<Producer> {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const res = await this.repo.delete(id);
    if (!res.affected) throw new NotFoundException('Produtor não encontrado');
  }
}
