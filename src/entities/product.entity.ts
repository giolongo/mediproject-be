import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ProductDetail } from './product-detail.entity';
import { File } from './file.entity';

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    priority: number;

    @OneToMany(() => ProductDetail, (detail) => detail.product, {
        cascade: true,
        eager: true
    })
    details: ProductDetail[];

    @OneToMany(() => File, (file) => file.product, {
        cascade: true,
        eager: true
    })
    files: File[];
}
