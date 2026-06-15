import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
dotenv.config();

import pool from './client';

async function migrate(): Promise<void> {
  console.log('[migrate] Running migrations...');
  const migrationPath = path.join(__dirname, 'migrations', '001_init.sql');
  const sql = fs.readFileSync(migrationPath, 'utf-8');

  const client = await pool.connect();
  try {
    await client.query(sql);
    console.log('[migrate] ✅ Migration complete');
  } catch (err) {
    console.error('[migrate] ❌ Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
