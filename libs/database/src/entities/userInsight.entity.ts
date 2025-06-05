import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Organization } from './organization.entity';

@Entity({ name: 'user_insights' })
export class UserInsight {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'datetime', name: 'insights_from' })
  insightsFrom: Date;

  @Column({ type: 'datetime', name: 'insights_to' })
  insightsTo: Date;

  @OneToOne(() => User, {
    eager: true,
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToOne(() => Organization, {
    eager: false,
  })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @CreateDateColumn({ nullable: false, name: 'created_at' })
  createdAt: string;

  @UpdateDateColumn({ nullable: true, name: 'updated_at' })
  updatedAt: string;
}
