import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Organization } from './organization.entity';

@Entity({ name: 'user_segments' })
export class UserSegment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, name: 'segment' })
  segment: string;

  @Column({ nullable: false, name: 'description' })
  description: string;

  @Column()
  summary: string;

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
}
