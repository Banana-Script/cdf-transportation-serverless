import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OrganizationCampaign, ValueDefinition } from '.';

@Entity({ name: 'campaign_messages' })
export class CampaignMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => OrganizationCampaign, { eager: false })
  @JoinColumn({ name: 'campaign_id' })
  campaign: OrganizationCampaign;

  @ManyToOne(() => ValueDefinition, { eager: false })
  @JoinColumn({ name: 'status_id' })
  status: ValueDefinition;

  @Column('text', { nullable: false })
  messageText: string;

  @CreateDateColumn({ nullable: true, name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ nullable: true, name: 'updated_at' })
  updatedAt: Date;
}
