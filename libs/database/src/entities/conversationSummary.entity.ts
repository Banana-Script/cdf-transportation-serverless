import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  JoinColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { Conversation } from './conversation.entity';

@Entity({ name: 'conversation_summaries' })
export class ConversationSummary {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'conversation_id' })
  conversationId: number;

  @Column('text')
  summary: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ nullable: true, name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => Conversation, {
    eager: false,
  })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;
}
