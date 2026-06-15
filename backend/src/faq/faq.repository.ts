import pool from '../db/client';
import { DatabaseError } from '../types/errors';

export interface FAQEntry {
  category: string;
  question: string;
  answer: string;
  priority: number;
}

export async function getAllActiveFAQs(): Promise<FAQEntry[]> {
  try {
    const result = await pool.query<FAQEntry>(
      `SELECT category, question, answer, priority
       FROM faq_entries
       WHERE is_active = TRUE
       ORDER BY priority DESC, id ASC`
    );
    return result.rows;
  } catch (err) {
    console.error('[faq-repo] getAllActiveFAQs error:', err);
    throw new DatabaseError();
  }
}
