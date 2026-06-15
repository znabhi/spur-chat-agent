import pool from '../../db/client';
import { DatabaseError } from '../../types/errors';

export interface Conversation {
  id: string;
  session_token: string;
  channel: string;
  created_at: Date;
  updated_at: Date;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender: 'user' | 'ai';
  text: string;
  token_count: number | null;
  created_at: Date;
}

export interface PaginatedMessages {
  messages: Message[];
  hasMore: boolean;
  nextCursor: string | null;
}

export class ChatRepository {
  async getOrCreateConversation(
    sessionToken: string | undefined,
    channel: string
  ): Promise<Conversation> {
    try {
      if (sessionToken) {
        const existing = await pool.query<Conversation>(
          'SELECT * FROM conversations WHERE session_token = $1',
          [sessionToken]
        );
        if (existing.rows.length > 0) return existing.rows[0];
      }
      const result = await pool.query<Conversation>(
        `INSERT INTO conversations (channel) VALUES ($1) RETURNING *`,
        [channel]
      );
      return result.rows[0];
    } catch (err) {
      console.error('[repo] getOrCreateConversation error:', err);
      throw new DatabaseError();
    }
  }

  async findConversationByToken(sessionToken: string): Promise<Conversation | null> {
    try {
      const result = await pool.query<Conversation>(
        'SELECT * FROM conversations WHERE session_token = $1',
        [sessionToken]
      );
      return result.rows[0] ?? null;
    } catch (err) {
      console.error('[repo] findConversationByToken error:', err);
      throw new DatabaseError();
    }
  }

  async saveMessage(
    conversationId: string,
    sender: 'user' | 'ai',
    text: string,
    tokenCount?: number
  ): Promise<Message> {
    try {
      const result = await pool.query<Message>(
        `INSERT INTO messages (conversation_id, sender, text, token_count)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [conversationId, sender, text, tokenCount ?? null]
      );
      return result.rows[0];
    } catch (err) {
      console.error('[repo] saveMessage error:', err);
      throw new DatabaseError();
    }
  }

  async getRecentMessages(conversationId: string, limit: number): Promise<Message[]> {
    try {
      const result = await pool.query<Message>(
        `SELECT * FROM (
           SELECT * FROM messages
           WHERE conversation_id = $1
           ORDER BY created_at DESC, id DESC
           LIMIT $2
         ) sub
         ORDER BY created_at ASC, id ASC`,
        [conversationId, limit]
      );
      return result.rows;
    } catch (err) {
      console.error('[repo] getRecentMessages error:', err);
      throw new DatabaseError();
    }
  }

  async getMessageHistory(
    conversationId: string,
    limit: number,
    before?: string
  ): Promise<PaginatedMessages> {
    try {
      let rows: Message[];

      if (before) {
        const result = await pool.query<Message>(
          `SELECT * FROM messages
           WHERE conversation_id = $1
             AND created_at < $2::TIMESTAMPTZ
           ORDER BY created_at DESC, id DESC
           LIMIT $3`,
          [conversationId, before, limit + 1]
        );
        rows = result.rows;
      } else {
        const result = await pool.query<Message>(
          `SELECT * FROM messages
           WHERE conversation_id = $1
           ORDER BY created_at DESC, id DESC
           LIMIT $2`,
          [conversationId, limit + 1]
        );
        rows = result.rows;
      }

      const hasMore = rows.length > limit;
      if (hasMore) rows.pop();

      const messages = rows.reverse();

      const nextCursor =
        hasMore && messages.length > 0
          ? messages[0].created_at.toISOString()
          : null;

      return { messages, hasMore, nextCursor };
    } catch (err) {
      console.error('[repo] getMessageHistory error:', err);
      throw new DatabaseError();
    }
  }
}

export const chatRepository = new ChatRepository();
