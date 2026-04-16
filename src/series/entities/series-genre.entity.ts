import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'series_genres', timestamps: true, updatedAt: false })
export class SeriesGenre extends Model<SeriesGenre> {
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
  declare genreId: number;
}
