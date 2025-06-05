import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserInsight } from './userInsight.entity';

@Entity({ name: 'user_insights_details' })
export class UserInsightDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  feature: string;

  @Column()
  value: string;

  @OneToOne(() => UserInsight, {
    eager: true,
  })
  @JoinColumn({ name: 'user_insight_id' })
  userInsight: UserInsight;

  @CreateDateColumn({ nullable: false, name: 'created_at' })
  createdAt: string;

  @UpdateDateColumn({ nullable: true, name: 'updated_at' })
  updatedAt: string;
}
