import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProducersModule } from './producers/producers.module';
import { FarmsModule } from './farms/farms.module';
import { SeasonsModule } from './seasons/seasons.module';
import { CultivationModule } from './cultivation/cultivation.module';

@Module({
  imports: [ProducersModule, FarmsModule, SeasonsModule, CultivationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
