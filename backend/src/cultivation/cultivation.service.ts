import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cultivation } from './entities/cultivation.entity';
import { CreateCultivationDto } from './dto/create-cultivation.dto';
import { UpdateCultivationDto } from './dto/update-cultivation.dto';
import { Farm } from '../farms/entities/farm.entity';
import { Season } from '../seasons/entities/season.entity';

@Injectable()
export class CultivationService {
  constructor(
    @InjectRepository(Cultivation)
    private readonly repo: Repository<Cultivation>,
    @InjectRepository(Farm)
    private readonly farmRepo: Repository<Farm>,
    @InjectRepository(Season)
    private readonly seasonRepo: Repository<Season>,
  ) {}

  async create(dto: CreateCultivationDto): Promise<Cultivation> {
    const farm = await this.farmRepo.findOne({ where: { id: dto.farmId } });
    if (!farm) throw new NotFoundException('Farm not found');

    const season = await this.seasonRepo.findOne({
      where: { id: dto.seasonId },
    });
    if (!season) throw new NotFoundException('Season not found');

    const entity = this.repo.create({ crop: dto.crop, farm, season });
    return this.repo.save(entity);
  }

  findAll(): Promise<Cultivation[]> {
    return this.repo.find({ relations: ['farm', 'season'] });
  }

  async findOne(id: string): Promise<Cultivation> {
    const ent = await this.repo.findOne({
      where: { id },
      relations: ['farm', 'season'],
    });
    if (!ent) throw new NotFoundException('Cultivation not found');
    return ent;
  }

  async update(id: string, dto: UpdateCultivationDto): Promise<Cultivation> {
    const ent = await this.findOne(id);
    if (dto.farmId) {
      const farm = await this.farmRepo.findOne({ where: { id: dto.farmId } });
      if (!farm) throw new NotFoundException('Farm not found');
      ent.farm = farm;
    }
    if (dto.seasonId) {
      const season = await this.seasonRepo.findOne({
        where: { id: dto.seasonId },
      });
      if (!season) throw new NotFoundException('Season not found');
      ent.season = season;
    }
    if (dto.crop) ent.crop = dto.crop;
    return this.repo.save(ent);
  }

  async remove(id: string): Promise<void> {
    const res = await this.repo.delete(id);
    if (!res.affected) throw new NotFoundException('Cultivation not found');
  }

  async findByFarmId(farmId: string): Promise<Cultivation[]> {
    return this.repo.find({
      where: { farm: { id: farmId } },
      relations: ['farm', 'season'], 
    });
  }
}
