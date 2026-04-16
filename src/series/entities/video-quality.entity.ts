import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Episode } from './episode.entity.js';
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize/lib/model';

@Table({ tableName: 'video_qualities', timestamps: true, updatedAt: false })
export class VideoQuality extends Model<
  InferAttributes<VideoQuality>,
  InferCreationAttributes<VideoQuality>
> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: CreationOptional<number>;

  @ForeignKey(() => Episode)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare episodeId: number;

  @Column({ type: DataType.STRING(10), allowNull: false })
  declare qualityLabel: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare resolutionWidth: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare resolutionHeight: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare bitrateKbps: number;

  @Column({ type: DataType.STRING(1000), allowNull: false })
  declare fileUrl: string;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare fileSizeMb: CreationOptional<number | null>;

  @Column({ type: DataType.STRING(50), allowNull: true })
  declare codec: CreationOptional<string | null>;

  @Column({ type: DataType.STRING(10), allowNull: false, defaultValue: 'm3u8' })
  declare containerFormat: CreationOptional<string>;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  declare isReady: CreationOptional<boolean>;

  @BelongsTo(() => Episode, 'episodeId')
  declare episode?: Episode;
}
