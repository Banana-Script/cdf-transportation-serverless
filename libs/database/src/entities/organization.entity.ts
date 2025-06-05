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
import { ValueDefinition } from './valueDefinition.entity';
import { OrganizationTag } from './organizationTags.entity';
import { OrganizationParameter } from './organizationParameter.entity';

@Entity({ name: 'organizations' })
export class Organization {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true, name: 'subscription_id' })
  subscriptionId: string;

  @Column({ nullable: true, name: 'subscription_status' })
  subscriptionStatus: string;

  @Column({ nullable: true, name: 'current_user_count' })
  currentUserCount: number;

  @Column({ nullable: true, name: 'total_user_count' })
  totalUserCount: number;

  @Column({ nullable: true, name: 'current_message_count' })
  currentMessageCount: number;

  @Column({ nullable: true, name: 'total_message_count' })
  totalMessageCount: number;

  @Column({ nullable: true, name: 'subscription_cuttoff_date' })
  subscriptionCuttoffDate: Date;

  @Column({ nullable: true, name: 'total_minutes_per_month' })
  totalMinutesPerMonth: number;

  @Column({ nullable: true, name: 'message_notified' })
  messageNotified: boolean;

  @Column({ nullable: true, name: 'uuid' })
  uuid: string;

  @Column({ nullable: true, name: 'command' })
  command: string;

  @Column({ nullable: true, name: 'stripe_paid' })
  stripePaid: boolean;

  @Column({ nullable: true, name: 'total_minutes_recharged' })
  totalMinutesRecharged: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    name: 'current_minutes_count',
  })
  currentMinutesCount: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    name: 'current_minutes_recharged',
  })
  currentMinutesRecharged: number;

  @Column({
    type: 'datetime', // Use 'datetime' for MySQL
    precision: 3, // Specify 3 for millisecond precision
    nullable: true,
    name: 'last_consumptions_update',
  })
  lastConsumptionsUpdate: Date;

  @ManyToOne(() => ValueDefinition)
  @JoinColumn({ name: 'status_id' })
  status: ValueDefinition;

  @OneToMany(() => OrganizationTag, (tag) => tag.organization)
  tags: OrganizationTag[];

  @OneToMany(() => OrganizationParameter, (parameter) => parameter.organization)
  parameters: OrganizationParameter[];

  @CreateDateColumn({ nullable: true, name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ nullable: true, name: 'updated_at' })
  updatedAt: Date;
}
