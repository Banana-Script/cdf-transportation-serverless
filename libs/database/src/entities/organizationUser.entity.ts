import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Organization, User, ValueDefinition } from '.';

@Entity({ name: 'organization_users' })
export class OrganizationUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'organization_id' })
  organizationId: number;

  @Column({ name: 'role_id' })
  roleId: number;

  @Column({ name: 'status_id' })
  statusId: number;

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

  @OneToOne(() => ValueDefinition, {
    eager: true,
  })
  @JoinColumn({ name: 'role_id' })
  role: ValueDefinition;

  @OneToOne(() => ValueDefinition, {
    eager: true,
  })
  @JoinColumn({ name: 'status_id' })
  status: ValueDefinition;

  @CreateDateColumn({ nullable: false, name: 'created_at' })
  createdAt: string;

  @UpdateDateColumn({ nullable: true, name: 'updated_at' })
  updatedAt: string;
}
