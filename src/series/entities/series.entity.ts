import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Category } from '../../category/entities/category.entity';
import { Genre } from '../../genre/entities/genre.entity';
import { Language } from '../../language/entities/language.entity';
import { Episode } from './episode.entity';
import { Season } from './season.entity';
import { SeriesGenre } from './series-genre.entity';
import { SeriesLanguage } from './series-language.entity';
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize/lib/model';

@Table({ tableName: 'series', timestamps: true })
export class Series extends Model<
  InferAttributes<Series>,
  InferCreationAttributes<Series>
> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: CreationOptional<number>;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare title: string;

  @Column({ type: DataType.STRING(255), allowNull: false, unique: true })
  declare slug: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare description: CreationOptional<string | null>;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare longDescription: CreationOptional<string | null>;

  @ForeignKey(() => Category)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare categoryId: CreationOptional<number | null>;

  @ForeignKey(() => Language)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare primaryLanguageId: CreationOptional<number | null>;

  @Column({ type: DataType.STRING(50), allowNull: false })
  declare contentType: string;

  @Column({ type: DataType.STRING(20), allowNull: false, defaultValue: 'ongoing' })
  declare seriesStatus: CreationOptional<string>;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare releaseYear: CreationOptional<number | null>;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 1 })
  declare totalSeasons: CreationOptional<number>;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  declare totalEpisodes: CreationOptional<number>;

  @Column({ type: DataType.DECIMAL(3, 1), allowNull: true })
  declare imdbRating: CreationOptional<string | number | null>;

  @Column({ type: DataType.STRING(10), allowNull: true })
  declare ageRating: CreationOptional<string | null>;

  @Column({ type: DataType.STRING(500), allowNull: true })
  declare posterUrl: CreationOptional<string | null>;

  @Column({ type: DataType.STRING(500), allowNull: true })
  declare bannerUrl: CreationOptional<string | null>;

  @Column({ type: DataType.STRING(500), allowNull: true })
  declare trailerUrl: CreationOptional<string | null>;

  @Column({ type: DataType.STRING(500), allowNull: true })
  declare thumbnailUrl: CreationOptional<string | null>;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  declare isPremium: CreationOptional<boolean>;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  declare baseCoinCost: CreationOptional<number>;

  @Column({ type: DataType.STRING(255), allowNull: true })
  declare metaTitle: CreationOptional<string | null>;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare metaDescription: CreationOptional<string | null>;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare keywords: CreationOptional<string | null>;

  @Column({
    type: DataType.ENUM('draft', 'scheduled', 'published', 'archived', 'removed'),
    allowNull: false,
    defaultValue: 'draft',
  })
  declare status: CreationOptional<'draft' | 'scheduled' | 'published' | 'archived' | 'removed'>;

  @Column({ type: DataType.BIGINT, allowNull: false, defaultValue: 0 })
  declare viewCount: CreationOptional<string | number>;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  declare likeCount: CreationOptional<number>;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  declare isFeatured: CreationOptional<boolean>;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  declare isTrending: CreationOptional<boolean>;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  declare isActive: CreationOptional<boolean>;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  declare sortOrder: CreationOptional<number>;

  @Column({ type: DataType.DATE, allowNull: true })
  declare publishedAt: CreationOptional<Date | null>;

  @BelongsTo(() => Category, 'categoryId')
  declare category?: Category;

  @BelongsTo(() => Language, 'primaryLanguageId')
  declare primaryLanguage?: Language;

  @BelongsToMany(() => Genre, () => SeriesGenre)
  declare genres?: Genre[];

  @BelongsToMany(() => Language, () => SeriesLanguage)
  declare languages?: Language[];

  @HasMany(() => Season, 'seriesId')
  declare seasons?: Season[];

  @HasMany(() => Episode, 'seriesId')
  declare episodes?: Episode[];
}
