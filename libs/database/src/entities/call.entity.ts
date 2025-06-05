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
import { Organization } from './organization.entity'; // Ensure this entity exists
import { LeadCall } from './leadCalls.entity';

export enum CallStatus {
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
}

export enum VapiStatus {
  ENDED = 'ENDED',
  IN_PROGRESS = 'IN_PROGRESS',
  FORWARDING = 'FORWARDING',
  PENDING = 'PENDING',
  QUEUED = 'QUEUED',
  RINGING = 'RINGING',
}

export enum CallType {
  OUTBOUND = 'OUTBOUND',
  INBOUND = 'INBOUND',
}

@Entity({ name: 'calls' })
@Index('ix_outbound_calls_campaign_id', ['campaign'])
@Index('ix_outbound_calls_id', ['id'])
export class Call {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => OutboundCampaign, (campaign) => campaign.id, { nullable: false })
  @JoinColumn({ name: 'campaign_id' })
  campaign: OutboundCampaign | null;

  @Column({ name: 'call_id', nullable: false, unique: true })
  callId: string;

  @Column({ name: 'to', nullable: false })
  to: string;

  @Column({ type: 'datetime', nullable: false })
  date: Date;

  @Column({ type: 'varchar', length: 10, nullable: true })
  duration: string | null;

  @Column({
    type: 'enum',
    enum: CallStatus,
    nullable: false,
    default: CallStatus.PENDING,
  })
  status: CallStatus;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', nullable: true })
  updatedAt: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  budget: number | null;

  @Column({ type: 'varchar', length: 512, nullable: true, name: 'ended_reason' })
  endedReason: string | null;

  @Column({
    type: 'enum',
    enum: VapiStatus,
    nullable: false,
    default: VapiStatus.PENDING,
    name: 'vapi_status',
  })
  vapiStatus: VapiStatus;

  @Column({ type: 'text', nullable: true, name: 'structured_data' })
  structuredData: string | null;

  @Column({ type: 'text', nullable: true, name: 'success_evaluation' })
  successEvaluation: string | null;

  @Column({
    type: 'enum',
    enum: CallType,
    nullable: false,
    default: CallType.OUTBOUND,
    name: 'type',
  })
  type: CallType;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'agent_phone' })
  agentPhone: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'agent_name' })
  agentName: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'customer_name' })
  customerName: string | null;

  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization | null;

  @Column({ type: 'text', nullable: true })
  summary: string | null;

  @OneToMany(() => LeadCall, (leadCall) => leadCall.call)
  leadCalls: LeadCall[];
}
