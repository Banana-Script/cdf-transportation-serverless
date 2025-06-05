import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { OutboundCampaign } from './outboundCampaign.entity';
import { User } from './user.entity';
import { VarsLead } from '.';
import { LeadCall } from './leadCalls.entity';

export enum LeadCallStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELED = 'CANCELED',
  FAILED_BUDGET_LIMIT = 'FAILED_BUDGET_LIMIT',
  FOLLOW_UP = 'FOLLOW_UP',
}

export enum LeadStatus {
  IMPORTED = 'IMPORTED',
  READY = 'READY',
}

@Entity({ name: 'leads' })
export class Lead {
  @PrimaryGeneratedColumn()
  @Index()
  id: number;

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => OutboundCampaign, (campaign) => campaign.id, { nullable: false })
  @JoinColumn({ name: 'outbound_campaign_id' })
  outboundCampaign: OutboundCampaign;

  @OneToMany(() => VarsLead, (vars) => vars.lead)
  vars: VarsLead[];

  @Column({ type: 'varchar', length: 50, nullable: false })
  timezone: string;

  @Column({ type: 'timestamp', nullable: false, name: 'trigger_datetime' })
  triggerDatetime: Date;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date;

  @Column({
    type: 'enum',
    enum: LeadCallStatus,
    nullable: false,
    default: LeadCallStatus.PENDING,
    name: 'call_status',
  })
  callStatus: LeadCallStatus;

  @Column({
    type: 'enum',
    enum: LeadStatus,
    nullable: false,
    default: LeadStatus.READY,
  })
  leadStatus: LeadStatus;

  @OneToMany(() => LeadCall, (leadCall) => leadCall.lead)
  leadCalls: LeadCall[];
}
