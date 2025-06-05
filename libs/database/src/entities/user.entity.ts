import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrganizationTag } from './organizationTags.entity';
import { ConversationTags } from './conversationTags.entity';
import { ConversationAssigns } from './conversationAssigns.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, name: 'fullname' })
  fullName: string;

  @Column()
  age: number;

  @Column()
  occupation: string;

  @Column()
  email: string;

  @CreateDateColumn({ nullable: false, name: 'created_at' })
  createdAt: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: string;

  @Column({ name: 'last_interaction' })
  lastInteraction: string;

  @Column({ nullable: false, name: 'session_id' })
  sessionId: string;

  @Column({ name: 'identification' })
  identification: string;

  @Column({ name: 'verifying_identification' })
  verifyingIdentification: number;

  @Column({ name: 'verification_code' })
  verificationCode: string;

  @Column({ name: 'verified' })
  verified: number;

  @Column({ name: 'interests_notifications_requested' })
  interestsNotificationsRequested: number;

  @Column({ name: 'interests_notifications_activated' })
  interestsNotificationsActivated: number;

  @Column({ name: 'interests_notifications_frequency' })
  interestsNotificationsFrequency: number;

  // FK's
  @OneToMany(() => OrganizationTag, (tag) => tag.modifiedBy)
  modifiedTags: OrganizationTag[];
  @OneToMany(() => ConversationAssigns, (assignations) => assignations.user)
  assignations: ConversationAssigns[];
  @OneToMany(() => ConversationTags, (conversationTag) => conversationTag.appliedBy)
  appliedTags: ConversationTags[];
}
