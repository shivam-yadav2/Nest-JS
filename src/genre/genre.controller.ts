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
import { AdminJwtAuthGuard } from '../admin/guards/admin-jwt-auth.guard';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { GenreService } from './genre.service';

@Controller()
export class GenreController {
  constructor(private readonly genreService: GenreService) {}

  @Get('genres')
  async getGenres() {
    const genres = await this.genreService.getGenres();

    return {
      success: true,
      data: genres,
      message: 'Genres fetched successfully',
    };
  }

  @Get('genres/:identifier')
  async getGenre(@Param('identifier') identifier: string) {
    const genre = await this.genreService.getGenre(identifier);

    return {
      success: true,
      data: genre,
      message: 'Genre fetched successfully',
    };
  }

  @UseGuards(AdminJwtAuthGuard)
  @Post('genres')
  async createGenre(@Body() dto: CreateGenreDto) {
    const genre = await this.genreService.createGenre(dto);

    return {
      success: true,
      data: genre,
      message: 'Genre created successfully',
    };
  }

  @UseGuards(AdminJwtAuthGuard)
  @Put('genres/:identifier')
  async updateGenre(
    @Param('identifier') identifier: string,
    @Body() dto: UpdateGenreDto,
  ) {
    const genre = await this.genreService.updateGenre(identifier, dto);

    return {
      success: true,
      data: genre,
      message: 'Genre updated successfully',
    };
  }

  @UseGuards(AdminJwtAuthGuard)
  @Delete('genres/:identifier')
  async deleteGenre(@Param('identifier') identifier: string) {
    await this.genreService.deleteGenre(identifier);

    return {
      success: true,
      data: null,
      message: 'Genre deleted successfully',
    };
  }
}
