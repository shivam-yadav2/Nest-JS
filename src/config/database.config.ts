import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const databaseConfig = SequelizeModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const database = configService.get('database', { infer: true });

    return {
      dialect: 'mysql',
      uri: database.url,
      logging: database.logging ? console.log : false,
      autoLoadModels: true,
      synchronize: database.sync,
      sync: database.syncAlter ? { alter: true } : undefined,
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
    };
  },
});
