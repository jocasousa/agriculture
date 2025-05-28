import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Season } from './entities/season.entity';
import { CreateSeasonDto } from './dto/create-season.dto';
import { UpdateSeasonDto } from './dto/update-season.dto';

@Injectable()
export class SeasonsService {
  constructor(
    @InjectRepository(Season)
    private readonly repo: Repository<Season>,
  ) {}

  create(dto: CreateSeasonDto): Promise<Season> {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  findAll(): Promise<Season[]> {
    return this.repo.find({ relations: ['cultivations'] });
  }

  async findOne(id: string): Promise<Season> {
    const season = await this.repo.findOne({
      where: { id },
      relations: ['cultivations'],
    });
    if (!season) throw new NotFoundException('Season not found');
    return season;
  }

  async update(id: string, dto: UpdateSeasonDto): Promise<Season> {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const res = await this.repo.delete(id);
    if (!res.affected) throw new NotFoundException('Season not found');
  }
}
