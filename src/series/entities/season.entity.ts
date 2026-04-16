import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Episode } from './episode.entity';
import { Series } from './series.entity';
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize/lib/model';

@Table({ tableName: 'seasons', timestamps: true })
export class Season extends Model<
  InferAttributes<Season>,
  InferCreationAttributes<Season>
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

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare seasonNumber: number;

  @Column({ type: DataType.STRING(255), allowNull: true })
  declare title: CreationOptional<string | null>;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare description: CreationOptional<string | null>;

  @Column({ type: DataType.STRING(500), allowNull: true })
  declare posterUrl: CreationOptional<string | null>;

  @Column({ type: DataType.STRING(500), allowNull: true })
  declare bannerUrl: CreationOptional<string | null>;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare releaseYear: CreationOptional<number | null>;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  declare totalEpisodes: CreationOptional<number>;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  declare isActive: CreationOptional<boolean>;

  @BelongsTo(() => Series, 'seriesId')
  declare series?: Series;

  @HasMany(() => Episode, 'seasonId')
  declare episodes?: Episode[];
}
