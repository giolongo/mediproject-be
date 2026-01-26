import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Product } from '../entities/product.entity';
import { ProductDetail } from '../entities/product-detail.entity';
import { File } from '../entities/file.entity';
import { StorageModule } from '../storage/storage.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Product, ProductDetail, File]),
        StorageModule,
    ],
    controllers: [ProductController],
    providers: [ProductService],
})
export class ProductModule { }
