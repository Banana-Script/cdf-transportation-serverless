import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Column,
} from 'typeorm';
import { CampaignAudience, CampaignMessage } from '.';

@Entity({ name: 'campaign_audience_messages' })
export class CampaignAudienceMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CampaignAudience)
  @JoinColumn({ name: 'campaign_audience_id' })
  campaignAudience: CampaignAudience;

  @ManyToOne(() => CampaignMessage)
  @JoinColumn({ name: 'campaign_message_id' })
  campaignMessage: CampaignMessage;

  @CreateDateColumn({ nullable: true, name: 'created_at' })
  createdAt: Date;

  @Column({ nullable: false })
  status: string;
}
