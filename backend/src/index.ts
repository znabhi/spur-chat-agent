import { validateEnv, config } from './config/env';

// Fail fast — exits if required env vars are missing
validateEnv();

import { createApp } from './app';

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`\n🚀 Spur Chat Agent running`);
  console.log(`   Local:   http://localhost:${config.port}`);
  console.log(`   Health:  http://localhost:${config.port}/health`);
  console.log(`   Env:     ${config.nodeEnv}\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[shutdown] SIGTERM received — shutting down gracefully');
  server.close(() => {
    console.log('[shutdown] Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n[shutdown] SIGINT received — shutting down');
  server.close(() => process.exit(0));
});
