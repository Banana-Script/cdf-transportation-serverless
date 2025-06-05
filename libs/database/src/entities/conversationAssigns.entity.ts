import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Conversation, User } from '.';

@Entity({ name: 'conversations_assigns' })
export class ConversationAssigns {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ primary: true, name: 'conversation_id' })
  conversationId: number;
  @Column({ nullable: true, name: 'user_id' })
  userId: number;

  // FK's
  @ManyToOne(() => Conversation, (conversation) => conversation.assignations)
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @ManyToOne(() => User, (user) => user.assignations)
  user: User;
}
