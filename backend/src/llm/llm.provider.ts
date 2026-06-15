// LLMProvider interface — Strategy Pattern
// Swap Groq → Anthropic → OpenAI by changing one env var.
// The ChatService never knows which provider is active.

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface LLMProvider {
  generateReply(
    history: ChatMessage[],
    userMessage: string,
    systemPrompt: string
  ): Promise<string>;
}
