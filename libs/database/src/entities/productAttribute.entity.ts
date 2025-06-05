import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { OrganizationProduct } from '.';

@Entity({ name: 'product_attributes' })
export class ProductAttribute {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => OrganizationProduct, { eager: false })
  @JoinColumn({ name: 'product_id' })
  product: OrganizationProduct;

  @Column({ nullable: false, name: 'attribute_name' })
  attributeName: string;

  @Column('text', { nullable: true })
  value: string;
}
