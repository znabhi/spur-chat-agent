-- db/migrations/001_init.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ──────────────────────────────────────────────────────────
-- conversations
-- One row per chat session.
-- session_token = what the client stores in localStorage.
-- id            = internal PK, never sent to client.
-- channel       = 'web' | 'whatsapp' | 'instagram' | 'facebook'
--                 Adding a new channel = 0 schema changes.
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token UUID        UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  channel       TEXT        NOT NULL DEFAULT 'web',
  metadata      JSONB       NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────
-- messages
-- User msg saved BEFORE LLM call; ai msg saved AFTER.
-- If LLM fails, the user message is still persisted.
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID        NOT NULL
                  REFERENCES conversations(id) ON DELETE CASCADE,
  sender          TEXT        NOT NULL CHECK (sender IN ('user', 'ai')),
  text            TEXT        NOT NULL,
  token_count     INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────
-- faq_entries
-- DB-backed knowledge base, cached in-memory (5-min TTL).
-- Update FAQ content without redeploying the backend.
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS faq_entries (
  id          SERIAL      PRIMARY KEY,
  category    TEXT        NOT NULL,
  question    TEXT        NOT NULL,
  answer      TEXT        NOT NULL,
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  priority    INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_session_token
  ON conversations (session_token);

-- Composite index for cursor-based keyset pagination
CREATE INDEX IF NOT EXISTS idx_messages_conv_cursor
  ON messages (conversation_id, created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_conversations_channel
  ON conversations (channel, created_at DESC);

-- Trigger: bump conversations.updated_at on every message insert
CREATE OR REPLACE FUNCTION fn_bump_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_message_bumps_conversation ON messages;
CREATE TRIGGER trg_message_bumps_conversation
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION fn_bump_conversation_updated_at();
