import OpenAI from 'openai';
import { config } from '../config/env';
import { LLMProvider, ChatMessage } from './llm.provider';
import {
  LLMTimeoutError,
  LLMRateLimitError,
  LLMInvalidKeyError,
  LLMContentFilterError,
} from '../types/errors';

export class GroqProvider implements LLMProvider {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: config.groqApiKey,
      baseURL: 'https://api.groq.com/openai/v1',
      timeout: 20_000,
      maxRetries: 1,
    });
  }

  async generateReply(
    history: ChatMessage[],
    userMessage: string,
    systemPrompt: string
  ): Promise<string> {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...history.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      { role: 'user', content: userMessage },
    ];

    try {
      const response = await this.client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages,
        max_tokens: config.maxTokens,
        temperature: 0.4,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new LLMContentFilterError();
      }

      return content.trim();
    } catch (err: unknown) {
      if (
        err instanceof LLMTimeoutError ||
        err instanceof LLMRateLimitError ||
        err instanceof LLMInvalidKeyError ||
        err instanceof LLMContentFilterError
      ) {
        throw err;
      }

      const error = err as { status?: number; code?: string; message?: string };

      if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
        throw new LLMTimeoutError();
      }
      if (error.status === 429) throw new LLMRateLimitError();
      if (error.status === 401 || error.status === 403) throw new LLMInvalidKeyError();
      if (error.status === 400 && error.message?.includes('content')) {
        throw new LLMContentFilterError();
      }

      console.error('[groq] Unexpected error:', error.message);
      throw new LLMTimeoutError();
    }
  }
}
