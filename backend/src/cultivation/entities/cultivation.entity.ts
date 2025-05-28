import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Farm } from '../../farms/entities/farm.entity';
import { Season } from '../../seasons/entities/season.entity';

@Entity({ name: 'cultivations' })
export class Cultivation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  crop: string;

  @ManyToOne(() => Farm, (farm) => farm.cultivations, { onDelete: 'CASCADE' })
  farm: Farm;

  @ManyToOne(() => Season, (season) => season.cultivations, {
    onDelete: 'CASCADE',
  })
  season: Season;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
