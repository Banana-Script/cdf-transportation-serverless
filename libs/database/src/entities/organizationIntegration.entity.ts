import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  JoinColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { ValueDefinition } from './valueDefinition.entity';
import { Organization } from './organization.entity';
import { IntegrationParameter } from './integrationParameter.entity';

@Entity({ name: 'organization_integrations' })
export class OrganizationIntegration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'organization_id' })
  organizationId: number;

  @OneToOne(() => ValueDefinition, {
    eager: false,
  })
  @JoinColumn({ name: 'name_id' })
  name: ValueDefinition;

  @OneToOne(() => ValueDefinition, {
    eager: false,
  })
  @JoinColumn({ name: 'status_id' })
  status: ValueDefinition;

  @OneToOne(() => Organization, {
    eager: false,
  })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @CreateDateColumn({ nullable: false, name: 'created_at' })
  createdAt: string;

  @UpdateDateColumn({ nullable: true, name: 'updated_at' })
  updatedAt: string;

  @OneToMany(() => IntegrationParameter, (parameter) => parameter.integration)
  parameters: IntegrationParameter[];
}
