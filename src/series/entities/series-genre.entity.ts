import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Genre } from '../../genre/entities/genre.entity';
import { Series } from './series.entity';

@Table({ tableName: 'series_genres', timestamps: true, updatedAt: false })
export class SeriesGenre extends Model<SeriesGenre> {
  @ForeignKey(() => Series)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
  })
  declare seriesId: number;

  @ForeignKey(() => Genre)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
  })
  declare genreId: number;
}
