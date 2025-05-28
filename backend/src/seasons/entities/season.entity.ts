import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Cultivation } from '../../cultivation/entities/cultivation.entity';

@Entity({ name: 'seasons' })
export class Season {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  year: number;

  @OneToMany(() => Cultivation, (c) => c.season)
  cultivations: Cultivation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
