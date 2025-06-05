import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Conversation } from './conversation.entity';

@Entity({ name: 'conversation_messages' })
export class ConversationMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'parent_conversation_id' })
  parentConversationId: number;

  @Column('text')
  message: string;

  @Column('json', { nullable: true })
  jsonMessage: object;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'tinyint', width: 1, nullable: false })
  readed: boolean;

  @Column({ type: 'varchar', length: 16, nullable: true })
  sessionId: string;

  @Column({ type: 'varchar', length: 16, nullable: true })
  type: string;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_conversation_id' })
  parentConversation: Conversation;
}
