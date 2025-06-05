import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { OrganizationCampaign, User } from '.';

@Entity({ name: 'campaign_audiences' })
export class CampaignAudience {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => OrganizationCampaign, { eager: false })
  @JoinColumn({ name: 'campaign_id' })
  campaign: OrganizationCampaign;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ nullable: true, name: 'created_at' })
  createdAt: Date;
}
