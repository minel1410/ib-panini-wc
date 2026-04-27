import { createClient } from '@libsql/client';
import { config } from 'dotenv';

config({ path: '.env.local' });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function setup() {
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      password_hash TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS user_stickers (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      sticker_id TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 0),
      PRIMARY KEY (user_id, sticker_id)
    );

    CREATE INDEX IF NOT EXISTS idx_stickers_user ON user_stickers(user_id);
    CREATE INDEX IF NOT EXISTS idx_stickers_id ON user_stickers(sticker_id);
  `);

  console.log('Database tables created successfully.');
}

setup().catch(console.error);
