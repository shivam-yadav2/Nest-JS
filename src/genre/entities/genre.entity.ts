import { Column, DataType, Model, Table } from 'sequelize-typescript';
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize/lib/model';

@Table({ tableName: 'genres', timestamps: true })
export class Genre extends Model<
  InferAttributes<Genre>,
  InferCreationAttributes<Genre>
> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: CreationOptional<number>;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    unique: true,
  })
  declare name: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    unique: true,
  })
  declare slug: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description: CreationOptional<string | null>;

  @Column({
    type: DataType.STRING(7),
    allowNull: true,
  })
  declare colorCode: CreationOptional<string | null>;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  declare isActive: CreationOptional<boolean>;
}
