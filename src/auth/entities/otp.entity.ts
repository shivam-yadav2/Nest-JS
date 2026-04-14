// src/auth/entities/otp.entity.ts
import { Table, Column, Model, DataType, ForeignKey } from 'sequelize-typescript';
import type { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import { User } from './user.entity';

export enum OtpType {
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
}

@Table({ tableName: 'otps', timestamps: true })
export class Otp extends Model<InferAttributes<Otp>, InferCreationAttributes<Otp>> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: CreationOptional<number>;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare userId: number | null;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare adminId: CreationOptional<number | null>;

  @Column({
    type: DataType.STRING(6),
    allowNull: false,
  })
  declare code: string;

  @Column({
    type: DataType.ENUM(...Object.values(OtpType)),
    allowNull: false,
  })
  declare type: OtpType;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare expiresAt: Date;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  })
  declare isUsed: CreationOptional<boolean>;
}