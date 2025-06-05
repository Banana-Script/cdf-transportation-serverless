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
import {
  CampaignAudience,
  CampaignMessage,
  Organization,
  OrganizationProduct,
  ValueDefinition,
} from '.';

@Entity({ name: 'organization_campaigns' })
export class OrganizationCampaign {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @ManyToOne(() => OrganizationProduct)
  @JoinColumn({ name: 'product_id' })
  product: OrganizationProduct;

  @ManyToOne(() => ValueDefinition)
  @JoinColumn({ name: 'channel_id' })
  channel: ValueDefinition;

  @ManyToOne(() => ValueDefinition)
  @JoinColumn({ name: 'campaign_type_id' })
  campaignType: ValueDefinition;

  @ManyToOne(() => ValueDefinition)
  @JoinColumn({ name: 'periodicity_type_id' })
  periodicityType: ValueDefinition;

  @Column({ nullable: false })
  objective: string;

  @Column({ nullable: false, name: 'key' })
  key: string;

  @Column({ type: 'datetime', nullable: false, name: 'start_date' })
  startDate: Date;

  @Column({ type: 'datetime', nullable: false, name: 'end_date' })
  endDate: Date;

  @Column({ nullable: false, name: 'periodicity_number' })
  periodicityNumber: number;

  @CreateDateColumn({ nullable: true, name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ nullable: true, name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => CampaignMessage, (campaignMessage) => campaignMessage.campaign)
  messages: CampaignMessage[];

  @OneToMany(() => CampaignAudience, (campaignAudience) => campaignAudience.campaign)
  audience: CampaignAudience[];
}
