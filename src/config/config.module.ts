// src/config/config.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { default as configuration } from './configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().optional(),
        DB_HOST: Joi.string().default('localhost'),
        DB_PORT: Joi.number().default(3307),
        DB_USER: Joi.string().default('root'),
        DB_PASSWORD: Joi.string().allow('').default(''),
        DB_NAME: Joi.string().default('ott'),
        DB_LOGGING: Joi.boolean().truthy('true').falsy('false').default(true),
        DB_SYNC: Joi.boolean().truthy('true').falsy('false').default(false),
        DB_SYNC_ALTER: Joi.boolean().truthy('true').falsy('false').default(false),
        JWT_SECRET: Joi.string().required(),
        REDIS_HOST: Joi.string().default('localhost'),
        REDIS_PORT: Joi.number().default(6379),
        VIDEO_HLS_PATH: Joi.string().default('./uploads/hls'),
        VIDEO_PROCESSED_PATH: Joi.string().default('./uploads/processed'),
        NODE_ENV: Joi.string().default('development'),
      }),
    }),
  ],
})
export class ConfigModuleCustom {}