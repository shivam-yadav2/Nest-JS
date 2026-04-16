import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AdminJwtAuthGuard } from '../admin/guards/admin-jwt-auth.guard';

@Controller()
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}

    @Get('categories')
    async getCategories() {
        const categories = await this.categoryService.getCategories();

        return {
            success: true,
            data: categories,
            message: 'Categories fetched successfully',
        };
    }

    @Get('categories/:identifier')
    async getCategory(@Param('identifier') identifier: string) {
        const category = await this.categoryService.getCategory(identifier);

        return {
            success: true,
            data: category,
            message: 'Category fetched successfully',
        };
    }

    @UseGuards(AdminJwtAuthGuard)
    @Post('categories')
    async createCategory(@Body() dto: CreateCategoryDto) {
        const category = await this.categoryService.createCategory(dto);

        return {
            success: true,
            data: category,
            message: 'Category created successfully',
        };
    }

    @UseGuards(AdminJwtAuthGuard)
    @Put('categories/:identifier')
    async updateCategory(@Param('identifier') identifier: string, @Body() dto: UpdateCategoryDto) {
        const category = await this.categoryService.updateCategory(identifier, dto);

        return {
            success: true,
            data: category,
            message: 'Category updated successfully',
        };
    }

    @UseGuards(AdminJwtAuthGuard)
    @Delete('categories/:identifier')
    async deleteCategory(@Param('identifier') identifier: string) {
        await this.categoryService.deleteCategory(identifier);

        return {
            success: true,
            data: null,
            message: 'Category deleted successfully',
        };
    }
}
