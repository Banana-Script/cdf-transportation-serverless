import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Organization, ProductAttribute } from '.';

@Entity({ name: 'organization_products' })
export class OrganizationProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Organization, { eager: false })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ nullable: false, name: 'product_name' })
  productName: string;

  @CreateDateColumn({ nullable: true, name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ nullable: true, name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => ProductAttribute, (productAttribute) => productAttribute.product)
  attributes: ProductAttribute[];
}
