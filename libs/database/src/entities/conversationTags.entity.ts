import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Conversation, User } from '.';
import { OrganizationTag } from './organizationTags.entity';

@Entity({ name: 'conversation_tags' })
export class ConversationTags {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ primary: true, name: 'conversation_id' })
  conversationId: number;
  @Column({ primary: true, name: 'tag_id' })
  tagId: number;
  @Column({ nullable: true, name: 'applied_by_id' })
  appliedById: number;

  // FK's
  @ManyToOne(() => Conversation, (conversation) => conversation.tags)
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @ManyToOne(() => OrganizationTag, (tag) => tag.conversations)
  @JoinColumn({ name: 'tag_id' })
  tag: OrganizationTag;

  @ManyToOne(() => User, (user) => user.appliedTags)
  appliedBy: User;
}
