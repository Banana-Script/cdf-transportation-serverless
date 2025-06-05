import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@Entity('system_parameters')
@Unique(['name'])
export class SystemParameter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  value: string;

  @CreateDateColumn({ nullable: false, name: 'created_at' })
  createdAt: string;

  @UpdateDateColumn({ nullable: true, name: 'updated_at' })
  updatedAt: string;
}
