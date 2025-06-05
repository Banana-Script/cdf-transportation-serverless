import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Organization } from './organization.entity';
import { Lead, VarsOutboundCampaign } from '.';

export enum CampaignStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity({ name: 'outbound_campaigns' })
export class OutboundCampaign {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Organization, (organization) => organization.id, { nullable: false })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @OneToMany(() => Lead, (lead) => lead.outboundCampaign)
  leads: Lead[];

  @OneToMany(() => VarsOutboundCampaign, (vars) => vars.outboundCampaign)
  vars: VarsOutboundCampaign[];

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  assistantId: string;

  @Column({ nullable: false })
  assistantName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  budget: number | null;

  @Column({ nullable: true })
  timezone: string | null;

  @Column({ type: 'int', nullable: true })
  callRetries: number | null;

  @Column({ type: 'int', nullable: true })
  retryIntervalHours: number | null;

  @Column({ type: 'json', nullable: true })
  callingSchedule: Record<string, any> | null;

  @Column({
    type: 'enum',
    enum: CampaignStatus,
    default: CampaignStatus.PENDING,
  })
  status: CampaignStatus;

  @Column({ type: 'timestamp', nullable: true, name: 'start_at' })
  startAt: Date | null;

  @Column({
    type: 'enum',
    enum: ['immediately', 'date_time_campaign', 'date_time_customer'],
    nullable: false,
  })
  triggerType: string;

  @Column({ name: 'follow_up_enabled' })
  followUpEnabled: boolean;

  @Column({ type: 'timestamp', nullable: true, name: 'trigger_datetime' })
  triggerDatetime: Date | null;

  @CreateDateColumn({ nullable: true, name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ nullable: true, name: 'updated_at' })
  updatedAt: Date;
}
