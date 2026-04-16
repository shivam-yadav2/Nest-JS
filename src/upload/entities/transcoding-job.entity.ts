import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Episode } from '../../series/entities/episode.entity';
import { UploadSession } from './upload-session.entity';
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize/lib/model';

@Table({ tableName: 'transcoding_jobs', timestamps: true })
export class TranscodingJob extends Model<
  InferAttributes<TranscodingJob>,
  InferCreationAttributes<TranscodingJob>
> {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  declare id: CreationOptional<number>;

  @ForeignKey(() => UploadSession)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare uploadSessionId: CreationOptional<number | null>;

  @ForeignKey(() => Episode)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare episodeId: CreationOptional<number | null>;

  @Column({
    type: DataType.ENUM('queued', 'running', 'done', 'failed', 'cancelled'),
    allowNull: false,
    defaultValue: 'queued',
  })
  declare status: CreationOptional<'queued' | 'running' | 'done' | 'failed' | 'cancelled'>;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  declare progress: CreationOptional<number>;

  @Column({ type: DataType.STRING(255), allowNull: true })
  declare currentStep: CreationOptional<string | null>;

  @Column({ type: DataType.STRING(1000), allowNull: true })
  declare outputManifestUrl: CreationOptional<string | null>;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare errorMessage: CreationOptional<string | null>;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare logs: CreationOptional<string | null>;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  declare attempted: CreationOptional<number>;

  @Column({ type: DataType.DATE, allowNull: true })
  declare completedAt: CreationOptional<Date | null>;

  @BelongsTo(() => UploadSession, 'uploadSessionId')
  declare uploadSession?: UploadSession;

  @BelongsTo(() => Episode, 'episodeId')
  declare episode?: Episode;
}
