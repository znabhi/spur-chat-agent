import { LLMProvider, ChatMessage } from './llm.provider';
import { GroqProvider } from './groq.provider';
import { buildSystemPrompt } from './prompt.builder';
import { getCachedFAQs, buildFAQContext } from '../faq/faq.cache';
import { config } from '../config/env';

// Singleton provider instance — chosen by LLM_PROVIDER env var
function createProvider(): LLMProvider {
  switch (config.llmProvider) {
    case 'groq':
    default:
      return new GroqProvider();
    // Future: case 'anthropic': return new AnthropicProvider();
    // Future: case 'openai':    return new OpenAIProvider();
  }
}

const provider = createProvider();

// This is the spec-required function signature
export async function generateReply(
  history: ChatMessage[],
  userMessage: string
): Promise<string> {
  // Fetch FAQ context (from 5-min in-memory cache, hits DB only on miss)
  const faqs = await getCachedFAQs();
  const faqContext = buildFAQContext(faqs);
  const systemPrompt = buildSystemPrompt(faqContext);

  return provider.generateReply(history, userMessage, systemPrompt);
}

export type { ChatMessage };
