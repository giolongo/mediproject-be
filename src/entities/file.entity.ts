import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('files')
export class File {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'id_product' })
    id_product: number;

    @Column()
    location: string;

    @Column()
    name: string;

    @ManyToOne(() => Product, (product) => product.files, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_product' })
    product: Product;
}
