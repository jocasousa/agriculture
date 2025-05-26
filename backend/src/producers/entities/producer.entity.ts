import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'producers' })
export class Producer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // CPF ou CNPJ
  @Column({ unique: true })
  document: string;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
