// src/auth/entities/otp.entity.ts
import { Table, Column, Model, DataType, ForeignKey } from 'sequelize-typescript';
import { User } from './user.entity';

export enum OtpType {
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
}

@Table({ tableName: 'otps', timestamps: true })
export class Otp extends Model<Otp> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  userId: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  adminId: number;

  @Column({
    type: DataType.STRING(6),
    allowNull: false,
  })
  code: string;

  @Column({
    type: DataType.ENUM(...Object.values(OtpType)),
    allowNull: false,
  })
  type: OtpType;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  expiresAt: Date;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  })
  isUsed: boolean;
}