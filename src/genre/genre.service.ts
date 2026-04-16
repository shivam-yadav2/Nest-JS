import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, UniqueConstraintError } from 'sequelize';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { Genre } from './entities/genre.entity';

@Injectable()
export class GenreService {
  constructor(@InjectModel(Genre) private readonly genreModel: typeof Genre) {}

  async getGenres(): Promise<Genre[]> {
    return this.genreModel.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']],
    });
  }

  async getGenre(identifier: string): Promise<Genre> {
    const genre = await this.findByIdentifier(identifier);

    if (!genre) {
      throw new NotFoundException('Genre not found');
    }

    return genre;
  }

  async createGenre(dto: CreateGenreDto): Promise<Genre> {
    const name = dto.name?.trim();
    const slug = dto.slug?.trim();

    if (!name || !slug) {
      throw new BadRequestException('Name and slug are required');
    }

    try {
      return await this.genreModel.create({
        name,
        slug,
        description: dto.description?.trim() || null,
        colorCode: dto.colorCode?.trim() || null,
        isActive: dto.isActive ?? true,
      });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new ConflictException('Genre with this slug already exists');
      }

      throw error;
    }
  }

  async updateGenre(identifier: string, dto: UpdateGenreDto): Promise<Genre> {
    const genre = await this.findByIdentifier(identifier);

    if (!genre) {
      throw new NotFoundException('Genre not found');
    }

    const patch: Partial<Genre> = {};

    if (dto.name !== undefined) patch.name = dto.name.trim();
    if (dto.slug !== undefined) patch.slug = dto.slug.trim();
    if (dto.description !== undefined) patch.description = dto.description?.trim() || null;
    if (dto.colorCode !== undefined) patch.colorCode = dto.colorCode?.trim() || null;
    if (dto.isActive !== undefined) patch.isActive = dto.isActive;

    try {
      await genre.update(patch);
      return genre;
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new ConflictException('Genre with this slug already exists');
      }

      throw error;
    }
  }

  async deleteGenre(identifier: string): Promise<void> {
    const genre = await this.findByIdentifier(identifier);

    if (!genre) {
      throw new NotFoundException('Genre not found');
    }

    await genre.destroy();
  }

  private async findByIdentifier(identifier: string): Promise<Genre | null> {
    const trimmed = identifier?.trim();

    if (!trimmed) {
      return null;
    }

    const isNumericId = /^\d+$/.test(trimmed);

    if (isNumericId) {
      return this.genreModel.findOne({
        where: {
          [Op.or]: [{ id: Number(trimmed) }, { slug: trimmed }],
        },
      });
    }

    return this.genreModel.findOne({
      where: { slug: trimmed },
    });
  }
}
