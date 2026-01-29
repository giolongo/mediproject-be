import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { ProductDetail } from '../entities/product-detail.entity';
import { File } from '../entities/file.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { StorageService } from '../storage/storage.service';
import { Express } from 'express';

@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
        @InjectRepository(ProductDetail)
        private productDetailRepository: Repository<ProductDetail>,
        @InjectRepository(File)
        private fileRepository: Repository<File>,
        private storageService: StorageService,
    ) { }

    async findAll(): Promise<Product[]> {
        return this.productRepository.find({
            relations: ['details', 'files'],
            order: {
                priority: 'ASC',
            },
        });
    }

    async findOne(id: number): Promise<Product> {
        const product = await this.productRepository.findOne({
            where: { id },
            relations: ['details', 'files'],
        });

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        return product;
    }

    async create(createProductDto: CreateProductDto): Promise<Product> {
        const { max } = await this.productRepository
            .createQueryBuilder('product')
            .select('MAX(product.priority)', 'max')
            .getRawOne();

        const product = this.productRepository.create({
            name: createProductDto.name,
            description: createProductDto.description,
            priority: (max || 0) + 1,
        });

        const savedProduct = await this.productRepository.save(product);

        // Create product details if provided
        if (createProductDto.details && createProductDto.details.length > 0) {
            const details = createProductDto.details.map(detail =>
                this.productDetailRepository.create({
                    ...detail,
                    id_product: savedProduct.id,
                })
            );
            await this.productDetailRepository.save(details);
        }

        return this.findOne(savedProduct.id);
    }

    async uploadFiles(id: number, files: Express.Multer.File[]): Promise<Product> {
        const product = await this.findOne(id);

        if (files && files.length > 0) {
            for (const file of files) {
                const location = await this.storageService.uploadFile(file, id);

                const fileEntity = this.fileRepository.create({
                    id_product: id,
                    name: file.originalname,
                    location,
                });

                await this.fileRepository.save(fileEntity);
            }
        }

        return this.findOne(id);
    }

    async update(
        id: number,
        updateProductDto: UpdateProductDto,
    ): Promise<Product> {
        const product = await this.findOne(id);

        // Update basic product fields
        if (updateProductDto.name) {
            product.name = updateProductDto.name;
        }
        if (updateProductDto.description) {
            product.description = updateProductDto.description;
        }
        if (updateProductDto.priority !== undefined) {
            product.priority = updateProductDto.priority;
        }

        await this.productRepository.save(product);

        // Update details if provided
        if (updateProductDto.details) {
            // Remove existing details
            await this.productDetailRepository.delete({ id_product: id });

            // Create new details
            const details = updateProductDto.details.map(detail =>
                this.productDetailRepository.create({
                    ...detail,
                    id_product: id,
                })
            );
            await this.productDetailRepository.save(details);
        }

        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        const product = await this.findOne(id);

        // Delete files from storage
        for (const file of product.files) {
            await this.storageService.deleteFile(file.location);
        }

        await this.productRepository.remove(product);
    }
}
