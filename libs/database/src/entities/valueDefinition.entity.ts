import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DefinitionType } from '.';

@Entity({ name: 'value_definitions' })
export class ValueDefinition {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  value_definition: string;

  @Column()
  description: string;

  @Column()
  active: string;

  @Column()
  validation_type: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({
    nullable: true,
    name: 'updated_at',
  })
  updatedAt: Date;

  @ManyToOne(() => DefinitionType, {
    eager: true,
  })
  @JoinColumn({ name: 'definition_type_id' })
  definitionType: DefinitionType;
}
