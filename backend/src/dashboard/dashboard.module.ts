import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Farm } from '../farms/entities/farm.entity';
import { Cultivation } from '../cultivation/entities/cultivation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Farm, Cultivation])],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
