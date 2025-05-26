import { Module } from '@nestjs/common';
import { CultivationController } from './cultivation.controller';
import { CultivationService } from './cultivation.service';

@Module({
  controllers: [CultivationController],
  providers: [CultivationService]
})
export class CultivationModule {}
