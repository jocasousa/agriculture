import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Farm } from './entities/farm.entity';
import { FarmsService } from './farms.service';
import { FarmsController } from './farms.controller';
import { Producer } from '../producers/entities/producer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Farm, Producer])],
  providers: [FarmsService],
  controllers: [FarmsController],
  exports: [TypeOrmModule],
})
export class FarmsModule {}
