export default () => {
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
  const dbUser = process.env.DB_USER || 'root';
  const dbPassword = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'ott';

  return {
    database: {
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      name: dbName,
      url: process.env.DATABASE_URL || `mysql://${dbUser}:${encodeURIComponent(dbPassword)}@${dbHost}:${dbPort}/${dbName}`,
      logging: process.env.DB_LOGGING === 'true' || process.env.NODE_ENV === 'development',
      sync: process.env.DB_SYNC !== 'false',
      syncAlter: process.env.DB_SYNC_ALTER === 'true',
    },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: '7d',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT  || '6379', 10),
  },
  video: {
    hlsPath: process.env.VIDEO_HLS_PATH || './uploads/hls',
    processedPath: process.env.VIDEO_PROCESSED_PATH || './uploads/processed',
  },
  nodeEnv: process.env.NODE_ENV || 'development',
  };
};