import { SequelizeModule } from '@nestjs/sequelize';

export const databaseConfig = SequelizeModule.forRoot({
  dialect: 'mysql',
  uri: process.env.DATABASE_URL,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
  },
});
