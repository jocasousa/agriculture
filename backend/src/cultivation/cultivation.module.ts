import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cultivation } from './entities/cultivation.entity';
import { CultivationService } from './cultivation.service';
import { CultivationController } from './cultivation.controller';
import { Farm } from '../farms/entities/farm.entity';
import { Season } from '../seasons/entities/season.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cultivation, Farm, Season])],
  providers: [CultivationService],
  controllers: [CultivationController],
  exports: [TypeOrmModule],
})
export class CultivationModule {}
