import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Producer } from '../../producers/entities/producer.entity';
import { Cultivation } from '../../cultivation/entities/cultivation.entity';

@Entity({ name: 'farms' })
export class Farm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column('float')
  totalArea: number;

  @Column('float')
  arableArea: number;

  @Column('float')
  vegetationArea: number;

  @ManyToOne(() => Producer, (p) => p.farms, { onDelete: 'CASCADE' })
  producer: Producer;

  @OneToMany(() => Cultivation, (cultivation) => cultivation.farm, {
    cascade: true,
  })
  cultivations: Cultivation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
