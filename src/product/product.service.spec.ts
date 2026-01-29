import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductService } from './product.service';
import { Product } from '../entities/product.entity';
import { ProductDetail } from '../entities/product-detail.entity';
import { File } from '../entities/file.entity';
import { StorageService } from '../storage/storage.service';
import { CreateProductDto } from './dto/create-product.dto';

describe('ProductService', () => {
    let service: ProductService;
    let productRepository;

    const mockProductRepository = {
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
        find: jest.fn(),
        createQueryBuilder: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            getRawOne: jest.fn().mockReturnValue({ max: 10 }),
        })),
    };

    const mockDetailRepository = {
        create: jest.fn(),
        save: jest.fn(),
        delete: jest.fn(),
    };

    const mockFileRepository = {
        create: jest.fn(),
        save: jest.fn(),
    };

    const mockStorageService = {
        uploadFile: jest.fn(),
        deleteFile: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProductService,
                {
                    provide: getRepositoryToken(Product),
                    useValue: mockProductRepository,
                },
                {
                    provide: getRepositoryToken(ProductDetail),
                    useValue: mockDetailRepository,
                },
                {
                    provide: getRepositoryToken(File),
                    useValue: mockFileRepository,
                },
                {
                    provide: StorageService,
                    useValue: mockStorageService,
                }
            ],
        }).compile();

        service = module.get<ProductService>(ProductService);
        productRepository = module.get(getRepositoryToken(Product));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a product with auto-incremented priority', async () => {
            const createProductDto: CreateProductDto = {
                name: 'Test Product',
                description: 'Test Description',
                priority: 1, // Should be ignored
            };

            const mockSavedProduct = { id: 1, ...createProductDto, priority: 11 };

            mockProductRepository.create.mockReturnValue(mockSavedProduct);
            mockProductRepository.save.mockResolvedValue(mockSavedProduct);
            mockProductRepository.findOne.mockResolvedValue(mockSavedProduct);

            // Setup query builder mock for this specific test
            const queryBuilderMock = {
                select: jest.fn().mockReturnThis(),
                getRawOne: jest.fn().mockResolvedValue({ max: 10 }),
            };
            mockProductRepository.createQueryBuilder.mockReturnValue(queryBuilderMock);

            const result = await service.create(createProductDto);

            expect(mockProductRepository.createQueryBuilder).toHaveBeenCalledWith('product');
            expect(queryBuilderMock.select).toHaveBeenCalledWith('MAX(product.priority)', 'max');
            expect(mockProductRepository.create).toHaveBeenCalledWith({
                name: createProductDto.name,
                description: createProductDto.description,
                priority: 11, // 10 + 1
            });
            expect(result).toEqual(mockSavedProduct);
        });

        it('should set priority to 1 if no products exist', async () => {
            const createProductDto: CreateProductDto = {
                name: 'First Product',
                description: 'First Description',
            };

            const mockSavedProduct = { id: 1, ...createProductDto, priority: 1 };

            mockProductRepository.create.mockReturnValue(mockSavedProduct);
            mockProductRepository.save.mockResolvedValue(mockSavedProduct);
            mockProductRepository.findOne.mockResolvedValue(mockSavedProduct);

            // Setup query builder mock for this specific test
            const queryBuilderMock = {
                select: jest.fn().mockReturnThis(),
                getRawOne: jest.fn().mockResolvedValue({ max: null }),
            };
            mockProductRepository.createQueryBuilder.mockReturnValue(queryBuilderMock);

            const result = await service.create(createProductDto);

            expect(mockProductRepository.create).toHaveBeenCalledWith({
                name: createProductDto.name,
                description: createProductDto.description,
                priority: 1, // 0 + 1
            });
        });
    });
});
