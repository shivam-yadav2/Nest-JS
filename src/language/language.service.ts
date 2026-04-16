import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, UniqueConstraintError } from 'sequelize';
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';
import { Language } from './entities/language.entity';

@Injectable()
export class LanguageService {
  constructor(@InjectModel(Language) private readonly languageModel: typeof Language) {}

  async getLanguages(): Promise<Language[]> {
    return this.languageModel.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']],
    });
  }

  async getLanguage(identifier: string): Promise<Language> {
    const language = await this.findByIdentifier(identifier);

    if (!language) {
      throw new NotFoundException('Language not found');
    }

    return language;
  }

  async createLanguage(dto: CreateLanguageDto): Promise<Language> {
    const name = dto.name?.trim();
    const code = dto.code?.trim();

    if (!name || !code) {
      throw new BadRequestException('Name and code are required');
    }

    try {
      return await this.languageModel.create({
        name,
        code,
        nativeName: dto.nativeName?.trim() || null,
        isActive: dto.isActive ?? true,
      });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new ConflictException('Language with this code already exists');
      }

      throw error;
    }
  }

  async updateLanguage(identifier: string, dto: UpdateLanguageDto): Promise<Language> {
    const language = await this.findByIdentifier(identifier);

    if (!language) {
      throw new NotFoundException('Language not found');
    }

    const patch: Partial<Language> = {};

    if (dto.name !== undefined) patch.name = dto.name.trim();
    if (dto.code !== undefined) patch.code = dto.code.trim();
    if (dto.nativeName !== undefined) patch.nativeName = dto.nativeName?.trim() || null;
    if (dto.isActive !== undefined) patch.isActive = dto.isActive;

    try {
      await language.update(patch);
      return language;
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new ConflictException('Language with this code already exists');
      }

      throw error;
    }
  }

  async deleteLanguage(identifier: string): Promise<void> {
    const language = await this.findByIdentifier(identifier);

    if (!language) {
      throw new NotFoundException('Language not found');
    }

    await language.destroy();
  }

  private async findByIdentifier(identifier: string): Promise<Language | null> {
    const trimmed = identifier?.trim();

    if (!trimmed) {
      return null;
    }

    const isNumericId = /^\d+$/.test(trimmed);

    if (isNumericId) {
      return this.languageModel.findOne({
        where: {
          [Op.or]: [{ id: Number(trimmed) }, { code: trimmed }],
        },
      });
    }

    return this.languageModel.findOne({
      where: { code: trimmed },
    });
  }
}
