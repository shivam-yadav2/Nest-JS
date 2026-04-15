import { Column, DataType, Model, Table } from 'sequelize-typescript';
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize/lib/model';

@Table({ tableName: 'admins', timestamps: true })
export class Admin extends Model<
  InferAttributes<Admin>,
  InferCreationAttributes<Admin>
> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: CreationOptional<number>;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  declare name: CreationOptional<string | null>;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    unique: true,
  })
  declare email: CreationOptional<string | null>;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    unique: true,
  })
  declare phone: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare passwordHash: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare isVerified: CreationOptional<boolean>;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    defaultValue: 'admin',
  })
  declare role: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  declare isActive: CreationOptional<boolean>;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare lastLoginAt: CreationOptional<Date | null>;
}
