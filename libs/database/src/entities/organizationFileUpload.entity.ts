import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ProcessingState {
  UPLOADED = 'UPLOADED',
  PROCESSING = 'PROCESSING',
  PROCESSED = 'PROCESSED',
  FAILED = 'FAILED',
}

@Entity('organization_file_uploads')
export class OrganizationFileUpload {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  organization_id: number;

  @Column({ length: 255 })
  file_name: string;

  @Column({ length: 255 })
  s3_file_path: string;

  @Column({
    type: 'enum',
    enum: ProcessingState,
    default: ProcessingState.UPLOADED,
  })
  processing_state: ProcessingState;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', nullable: true })
  updated_at: Date;
}
