import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, UniqueConstraintError } from 'sequelize';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
    constructor(@InjectModel(Category) private readonly categoryModel: typeof Category) {}

    async getCategories(): Promise<Category[]> {
        return this.categoryModel.findAll({
            where: { isActive: true },
            order: [
                ['sortOrder', 'ASC'],
                ['name', 'ASC'],
            ],
        });
    }

    async getCategory(identifier: string): Promise<Category> {
        const category = await this.findByIdentifier(identifier);

        if (!category || !category.isActive) {
            throw new NotFoundException('Category not found');
        }
        return category;
    }

    async createCategory(dto: CreateCategoryDto): Promise<Category> {
        const name = dto.name?.trim();
        const slug = dto.slug?.trim();
        if (!name || !slug) {
            throw new BadRequestException('Name and slug are required');
        }
        try {
            return await this.categoryModel.create({
                name,
                slug,
                description: dto.description?.trim() || null,
                iconUrl: dto.iconUrl?.trim() || null,
                bannerUrl: dto.bannerUrl?.trim() || null,
                sortOrder: dto.sortOrder ?? 0,
                isActive: dto.isActive ?? true,
            });
        } catch (error) {
            if (error instanceof UniqueConstraintError) {
                throw new ConflictException('Category with this slug already exists');
            }
            throw error;
        }
    }

    async updateCategory(identifier: string, dto: UpdateCategoryDto): Promise<Category> {
        const category = await this.findByIdentifier(identifier);

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        const patch: Partial<Category> = {};

        if (dto.name !== undefined) patch.name = dto.name.trim();
        if (dto.slug !== undefined) patch.slug = dto.slug.trim();
        if (dto.description !== undefined) patch.description = dto.description?.trim() || null;
        if (dto.iconUrl !== undefined) patch.iconUrl = dto.iconUrl?.trim() || null;
        if (dto.bannerUrl !== undefined) patch.bannerUrl = dto.bannerUrl?.trim() || null;
        if (dto.sortOrder !== undefined) patch.sortOrder = dto.sortOrder;
        if (dto.isActive !== undefined) patch.isActive = dto.isActive;

        try {
            await category.update(patch);
            return category;
        } catch (error) {
            if (error instanceof UniqueConstraintError) {
                throw new ConflictException('Category with this slug already exists');
            }

            throw error;
        }
    }

    async deleteCategory(identifier: string): Promise<void> {
        const category = await this.findByIdentifier(identifier);

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        await category.destroy();
    }

    private async findByIdentifier(identifier: string): Promise<Category | null> {
        const trimmed = identifier?.trim();

        if (!trimmed) {
            return null;
        }

        const isNumericId = /^\d+$/.test(trimmed);

        if (isNumericId) {
            return this.categoryModel.findOne({
                where: {
                    [Op.or]: [{ id: Number(trimmed) }, { slug: trimmed }],
                },
            });
        }

        return this.categoryModel.findOne({
            where: { slug: trimmed },
        });
    }
}
