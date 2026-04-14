// src/auth/entities/user.entity.ts
import { Table, Column, Model, DataType } from 'sequelize-typescript';
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';

@Table({ tableName: 'users', timestamps: true })
export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: CreationOptional<number>;

  @Column({
    type: DataType.STRING(255),
    unique: true,
    allowNull: true,
  })
  declare email: CreationOptional<string | null>;

  @Column({
    type: DataType.STRING(20),
    unique: true,
    allowNull: true,
  })
  declare phone: CreationOptional<string | null>;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  declare passwordHash: CreationOptional<string | null>;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  declare displayName: CreationOptional<string | null>;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
  })
  declare avatarUrl: CreationOptional<string | null>;

  @Column({
    type: DataType.STRING(10),
    defaultValue: 'en',
  })
  declare locale: CreationOptional<string>;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  declare isActive: CreationOptional<boolean>;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare isVerified: CreationOptional<boolean>;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare lastLoginAt: CreationOptional<Date | null>;

  @Column({
    type: DataType.JSON,
    defaultValue: {},
  })
  declare metadata: CreationOptional<Record<string, unknown>>;
}
