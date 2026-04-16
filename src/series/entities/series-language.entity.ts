import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Language } from '../../language/entities/language.entity';
import { Series } from './series.entity';

@Table({ tableName: 'series_languages', timestamps: true, updatedAt: false })
export class SeriesLanguage extends Model<SeriesLanguage> {
  @ForeignKey(() => Series)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
  })
  declare seriesId: number;

  @ForeignKey(() => Language)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
  })
  declare languageId: number;

  @Column({
    type: DataType.ENUM('audio', 'subtitle'),
    allowNull: false,
    primaryKey: true,
  })
  declare languageType: 'audio' | 'subtitle';
}
