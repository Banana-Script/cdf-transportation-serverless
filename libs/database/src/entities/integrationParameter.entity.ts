import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { OrganizationIntegration } from './organizationIntegration.entity';

@Entity({ name: 'integration_parameters' })
export class IntegrationParameter {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => OrganizationIntegration, (integration) => integration.parameters)
  @JoinColumn({ name: 'integration_id' })
  integration: OrganizationIntegration;

  @Column({ nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  value: string;
}
