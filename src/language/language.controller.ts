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
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';
import { LanguageService } from './language.service';

@Controller()
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  @Get('languages')
  async getLanguages() {
    const languages = await this.languageService.getLanguages();

    return {
      success: true,
      data: languages,
      message: 'Languages fetched successfully',
    };
  }

  @Get('languages/:identifier')
  async getLanguage(@Param('identifier') identifier: string) {
    const language = await this.languageService.getLanguage(identifier);

    return {
      success: true,
      data: language,
      message: 'Language fetched successfully',
    };
  }

  @UseGuards(AdminJwtAuthGuard)
  @Post('languages')
  async createLanguage(@Body() dto: CreateLanguageDto) {
    const language = await this.languageService.createLanguage(dto);

    return {
      success: true,
      data: language,
      message: 'Language created successfully',
    };
  }

  @UseGuards(AdminJwtAuthGuard)
  @Put('languages/:identifier')
  async updateLanguage(
    @Param('identifier') identifier: string,
    @Body() dto: UpdateLanguageDto,
  ) {
    const language = await this.languageService.updateLanguage(identifier, dto);

    return {
      success: true,
      data: language,
      message: 'Language updated successfully',
    };
  }

  @UseGuards(AdminJwtAuthGuard)
  @Delete('languages/:identifier')
  async deleteLanguage(@Param('identifier') identifier: string) {
    await this.languageService.deleteLanguage(identifier);

    return {
      success: true,
      data: null,
      message: 'Language deleted successfully',
    };
  }
}
