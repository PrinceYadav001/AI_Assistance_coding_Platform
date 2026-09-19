import dotenv from 'dotenv';
dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-dsa-assessment',
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production',
    expiresIn: '15m',
    refreshExpiresIn: '7d',
  },
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8001',
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  execution: {
    provider: process.env.CODE_EXECUTION_PROVIDER || 'judge0',
    judge0Url: process.env.JUDGE0_URL || 'https://judge0-ce.p.rapidapi.com',
    judge0ApiKey: process.env.JUDGE0_API_KEY || '',
  },
  bcryptRounds: 12,
};
