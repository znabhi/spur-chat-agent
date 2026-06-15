import dotenv from 'dotenv';
dotenv.config();

const REQUIRED_VARS = ['GROQ_API_KEY', 'DATABASE_URL'] as const;

export function validateEnv(): void {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`\n[startup] ❌ Missing required environment variables:\n  ${missing.join('\n  ')}`);
    console.error('[startup] Copy .env.example to .env and fill in the values.\n');
    process.exit(1);
  }
  console.log('[startup] ✅ Environment validated');
}

export const config = {
  port:         Number(process.env.PORT) || 3001,
  nodeEnv:      process.env.NODE_ENV || 'development',
  databaseUrl:  process.env.DATABASE_URL!,
  groqApiKey:   process.env.GROQ_API_KEY!,
  corsOrigin:   process.env.CORS_ORIGIN || 'http://localhost:3000',
  llmProvider:  process.env.LLM_PROVIDER || 'groq',
  maxTokens:    Number(process.env.MAX_TOKENS) || 500,
  historyLimit: Number(process.env.HISTORY_LIMIT) || 10,
} as const;
