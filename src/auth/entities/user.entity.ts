// src/auth/entities/user.entity.ts
import { Table, Column, Model, DataType, Index } from 'sequelize-typescript';

@Table({ tableName: 'users', timestamps: true })
export class User extends Model<User> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.STRING(255),
    unique: true,
    allowNull: true,
  })
  email: string;

  @Column({
    type: DataType.STRING(20),
    unique: true,
    allowNull: true,
  })
  phone: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  passwordHash: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  displayName: string;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
  })
  avatarUrl: string;

  @Column({
    type: DataType.STRING(10),
    defaultValue: 'en',
  })
  locale: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  isActive: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isVerified: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  lastLoginAt: Date;

  @Column({
    type: DataType.JSON,
    defaultValue: {},
  })
  metadata: object;
}