import { Column, DataType, Model, Table } from 'sequelize-typescript';
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize/lib/model';

@Table({ tableName: 'upload_sessions', timestamps: true })
export class UploadSession extends Model<
  InferAttributes<UploadSession>,
  InferCreationAttributes<UploadSession>
> {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  declare id: CreationOptional<number>;

  @Column({ type: DataType.STRING(100), allowNull: false, unique: true })
  declare sessionId: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare originalFilename: string;

  @Column({ type: DataType.BIGINT, allowNull: false })
  declare totalSize: string | number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare totalChunks: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  declare uploadedChunks: CreationOptional<number>;

  @Column({
    type: DataType.ENUM('active', 'completed', 'merged', 'processing', 'failed', 'expired'),
    allowNull: false,
    defaultValue: 'active',
  })
  declare status: CreationOptional<'active' | 'completed' | 'merged' | 'processing' | 'failed' | 'expired'>;

  @Column({ type: DataType.DATE, allowNull: false })
  declare expiresAt: Date;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare metadata: CreationOptional<string | null>;
}
