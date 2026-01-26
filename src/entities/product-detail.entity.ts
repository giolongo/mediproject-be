import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('product_details')
export class ProductDetail {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'id_product' })
    id_product: number;

    @Column()
    label: string;

    @Column('text')
    description: string;

    @ManyToOne(() => Product, (product) => product.details, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_product' })
    product: Product;
}
