import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
} from 'typeorm';

@Entity({ name: 'definition_types' })
export class DefinitionType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  definition_type: string;

  @Column()
  description: string;

  @Column()
  active: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({
    nullable: true,
    name: 'updated_at',
  })
  updatedAt: Date;
}
