import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'series_languages', timestamps: true, updatedAt: false })
export class SeriesLanguage extends Model<SeriesLanguage> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
  })
  declare seriesId: number;

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
