import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Season } from './season.entity';
import { Series } from './series.entity';
import { VideoQuality } from './video-quality.entity';
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize/lib/model';

@Table({ tableName: 'episodes', timestamps: true })
export class Episode extends Model<
  InferAttributes<Episode>,
  InferCreationAttributes<Episode>
> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: CreationOptional<number>;

  @ForeignKey(() => Series)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare seriesId: number;

  @ForeignKey(() => Season)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare seasonId: CreationOptional<number | null>;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare episodeNumber: number;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare title: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare slug: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare description: CreationOptional<string | null>;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare durationSeconds: CreationOptional<number | null>;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare fileSizeMb: CreationOptional<number | null>;

  @Column({ type: DataType.STRING(500), allowNull: true })
  declare thumbnailUrl: CreationOptional<string | null>;

  @Column({ type: DataType.STRING(500), allowNull: true })
  declare previewUrl: CreationOptional<string | null>;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  declare coinCost: CreationOptional<number>;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  declare isFree: CreationOptional<boolean>;

  @Column({ type: DataType.DATE, allowNull: true })
  declare freeUntil: CreationOptional<Date | null>;

  @Column({
    type: DataType.ENUM('pending', 'uploading', 'processing', 'ready', 'failed'),
    allowNull: false,
    defaultValue: 'pending',
  })
  declare uploadStatus: CreationOptional<'pending' | 'uploading' | 'processing' | 'ready' | 'failed'>;

  @Column({ type: DataType.BIGINT, allowNull: false, defaultValue: 0 })
  declare viewCount: CreationOptional<string | number>;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  declare processingProgress: CreationOptional<number>;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  declare likeCount: CreationOptional<number>;

  @Column({
    type: DataType.ENUM('draft', 'scheduled', 'published', 'archived', 'removed'),
    allowNull: false,
    defaultValue: 'draft',
  })
  declare status: CreationOptional<'draft' | 'scheduled' | 'published' | 'archived' | 'removed'>;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  declare isActive: CreationOptional<boolean>;

  @Column({ type: DataType.DATE, allowNull: true })
  declare publishedAt: CreationOptional<Date | null>;

  @BelongsTo(() => Series, 'seriesId')
  declare series?: Series;

  @BelongsTo(() => Season, 'seasonId')
  declare season?: Season;

  @HasMany(() => VideoQuality, 'episodeId')
  declare videoQualities?: VideoQuality[];
}
