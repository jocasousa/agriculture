import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Farm } from '../farms/entities/farm.entity';
import { Cultivation } from '../cultivation/entities/cultivation.entity';
import { SummaryDto } from './dto/summary.dto';
import { StateCountDto } from './dto/state-count.dto';
import { CropCountDto } from './dto/crop-count.dto';
import { LandUseDto } from './dto/land-use.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Farm)
    private readonly farmRepo: Repository<Farm>,
    @InjectRepository(Cultivation)
    private readonly cultRepo: Repository<Cultivation>,
  ) {}

  async getSummary(): Promise<SummaryDto> {
    const { count, sum } = await this.farmRepo
      .createQueryBuilder('f')
      .select('COUNT(*)', 'count')
      .addSelect('SUM(f.totalArea)', 'sum')
      .getRawOne();
    return { totalFarms: Number(count), totalArea: Number(sum) };
  }

  async getByState(): Promise<StateCountDto[]> {
    const rows = await this.farmRepo
      .createQueryBuilder('f')
      .select('f.state', 'state')
      .addSelect('COUNT(*)', 'count')
      .groupBy('f.state')
      .getRawMany();
    return rows.map((r) => ({ state: r.state, count: Number(r.count) }));
  }

  async getByCrop(): Promise<CropCountDto[]> {
    const rows = await this.cultRepo
      .createQueryBuilder('c')
      .select('c.crop', 'crop')
      .addSelect('COUNT(*)', 'count')
      .groupBy('c.crop')
      .getRawMany();
    return rows.map((r) => ({ crop: r.crop, count: Number(r.count) }));
  }

  async getLandUse(): Promise<LandUseDto> {
    const { arable, vegetation } = await this.farmRepo
      .createQueryBuilder('f')
      .select('SUM(f.arableArea)', 'arable')
      .addSelect('SUM(f.vegetationArea)', 'vegetation')
      .getRawOne();
    return { arable: Number(arable), vegetation: Number(vegetation) };
  }
}
