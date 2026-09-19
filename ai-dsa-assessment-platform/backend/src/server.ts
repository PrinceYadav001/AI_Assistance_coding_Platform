import { connectDatabase } from './config/database';
import { getRedisClient } from './config/redis';
import { config } from './config/config';
import app from './app';

async function bootstrap(): Promise<void> {
  console.log('🚀 Starting AI DSA Assessment Platform...');
  console.log(`📦 Environment: ${config.nodeEnv}`);

  // Connect database
  await connectDatabase();

  // Initialize Redis (optional - graceful degradation)
  getRedisClient();

  const server = app.listen(config.port, () => {
    console.log(`✅ Backend running on http://localhost:${config.port}`);
    console.log(`📖 Health check: http://localhost:${config.port}/health`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string): Promise<void> => {
    console.log(`\n${signal} received. Graceful shutdown...`);
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
  });
}

bootstrap().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
