import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  JoinColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { ValueDefinition } from './valueDefinition.entity';
import { OrganizationIntegration } from './organizationIntegration.entity';
import { Organization } from './organization.entity';
import { ConversationTags } from './conversationTags.entity';
import { ConversationAssigns } from './conversationAssigns.entity';
import { ConversationMessage } from './conversationMessage.entity';

@Entity({ name: 'conversations' })
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'organization_id' })
  organizationId: number;

  @Column({ name: 'status_id' })
  statusId: number;

  @Column({ name: 'agent_id' })
  agentId: number;

  @Column()
  priority: string;

  @Column()
  category: string;

  @Column()
  sentiment: string;

  @CreateDateColumn({ nullable: false, name: 'created_at' })
  createdAt: string;

  @UpdateDateColumn({ nullable: true, name: 'updated_at' })
  updatedAt: string;

  @Column({ type: 'tinyint', width: 1, nullable: false })
  readed: boolean;

  @Column({ type: 'tinyint', width: 1, nullable: false })
  locked: boolean;

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

  @OneToOne(() => User, {
    eager: true,
  })
  @JoinColumn({ name: 'agent_id' })
  agent: User;

  @OneToOne(() => ValueDefinition, {
    eager: true,
  })
  @JoinColumn({ name: 'status_id' })
  status: ValueDefinition;

  @OneToOne(() => OrganizationIntegration, {
    eager: true,
  })
  @JoinColumn({ name: 'integration_id' })
  integration: OrganizationIntegration;

  // // MtM Relationship - Tags
  @OneToMany(() => ConversationTags, (converTag) => converTag.conversation)
  tags: number;

  // // MtM Relationship - Assigns
  @OneToMany(() => ConversationAssigns, (assignations) => assignations.conversation)
  assignations: number;

  // One-to-Many relationship with ConversationMessage
  @OneToMany(() => ConversationMessage, (message) => message.parentConversation, {
    cascade: true,
  })
  messages: ConversationMessage[];
}
