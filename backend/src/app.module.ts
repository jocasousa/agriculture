// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { ProducersModule } from './producers/producers.module';
import { FarmsModule } from './farms/farms.module';
import { SeasonsModule } from './seasons/seasons.module';
import { CultivationModule } from './cultivation/cultivation.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      port: 5432,
    }),
    ProducersModule,
    FarmsModule,
    SeasonsModule,
    CultivationModule,
  ],
})
export class AppModule {}
