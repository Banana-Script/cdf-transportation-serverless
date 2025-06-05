import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Column,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { User } from './user.entity';
import { Organization } from './organization.entity';

@Entity({ name: 'broadcast_messages' })
export class BroadcastMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'organization_id' })
  organizationId: number;

  @Column({ name: 'status' })
  status: string;

  @Column({ name: 'message' })
  message: string;

  @Column({ name: 'numbers' })
  numbers: string;

  @CreateDateColumn({ nullable: false, name: 'created_at' })
  createdAt: string;

  @Column({ name: 'template' })
  template: string;

  @Column({ name: 'bucket_key' })
  bucketKey: string;

  @Column({ name: 'footer' })
  footer: string;

  @Column({ name: 'image_key' })
  imageKey: string;

  @Column({ name: 'template_id' })
  templateId: string;

  @Column({ name: 'api_status' })
  apiStatus: string;

  @OneToOne(() => User, {
    eager: true,
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToOne(() => Organization, {
    eager: true,
  })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;
}
