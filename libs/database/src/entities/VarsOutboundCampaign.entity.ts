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
import { OutboundCampaign } from '.';

@Entity({ name: 'vars_outbound_campaigns' })
export class VarsOutboundCampaign {
  @PrimaryGeneratedColumn()
  @Index()
  id: number;

  @ManyToOne(() => OutboundCampaign, (campaign) => campaign.id, { nullable: false })
  @JoinColumn({ name: 'outbound_campaign_id' })
  outboundCampaign: OutboundCampaign;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: false, name: 'default_value' })
  defaultValue: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date;
}
