import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Call } from './call.entity';
import { Lead } from './leads.entity';

export enum FollowUpStatus {
  COMPLETED = 'completed',
  SCHEDULED = 'scheduled',
  FAILED = 'failed',
  IN_PROGRESS = 'in_progress',
  CANCELLED = 'cancelled',
}

@Entity({ name: 'lead_calls' })
export class LeadCall {
  @PrimaryGeneratedColumn()
  @Index()
  id: number;

  @Column({ nullable: false })
  @Index()
  lead_id: number;

  @Column({ nullable: true })
  call_id: number;

  @Column({ nullable: false, default: 1 })
  call_attempt: number;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({
    name: 'follow_up_date',
    type: 'timestamp',
    nullable: true,
  })
  followUpDate: Date | null;

  @Column({
    type: 'enum',
    enum: FollowUpStatus,
    default: FollowUpStatus.SCHEDULED,
    nullable: false,
  })
  status: FollowUpStatus;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    nullable: true,
  })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Lead, (lead) => lead.leadCalls, { nullable: false })
  @JoinColumn({ name: 'lead_id' })
  lead: Lead;

  @ManyToOne(() => Call, (call) => call.leadCalls, { nullable: true })
  @JoinColumn({ name: 'call_id', referencedColumnName: 'callId' })
  call: Call;
}
