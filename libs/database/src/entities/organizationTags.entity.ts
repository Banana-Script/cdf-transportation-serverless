import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Organization, User } from '.';
import { ConversationTags } from './conversationTags.entity';

@Entity({ name: 'organization_tags' })
export class OrganizationTag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, name: 'tag_name' })
  name: string;
  @Column({ nullable: false, name: 'description' })
  description: string;
  @Column({ nullable: true, name: 'modified_by_id' })
  modifiedById: number;
  @Column({ name: 'organization_id' })
  organizationId: number;

  @CreateDateColumn({ nullable: true, name: 'created_at' })
  createdAt: Date;
  @UpdateDateColumn({ nullable: true, name: 'updated_at' })
  updatedAt: Date;

  // FK's
  @ManyToOne(() => User, (user) => user.modifiedTags, { onDelete: 'SET NULL' })
  modifiedBy: User;
  @ManyToOne(() => Organization, (organization) => organization.tags)
  organization: Organization;
  @OneToMany(() => ConversationTags, (converTag) => converTag.tag)
  conversations: number;
}
