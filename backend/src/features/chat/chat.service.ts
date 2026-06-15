import { chatRepository } from './chat.repository';
import { generateReply, ChatMessage } from '../../llm/llm.service';
import { LLMContentFilterError } from '../../types/errors';

export interface SendMessageResult {
  reply: string;
  sessionId: string;
  messageId: string;
}

export interface GetHistoryResult {
  sessionId: string;
  messages: Array<{
    id: string;
    sender: 'user' | 'ai';
    text: string;
    createdAt: string;
  }>;
  pagination: {
    hasMore: boolean;
    nextCursor: string | null;
  };
}

export class ChatService {
  async sendMessage(
    sessionToken: string | undefined,
    userText: string,
    channel = 'web'
  ): Promise<SendMessageResult> {
    const conversation = await chatRepository.getOrCreateConversation(sessionToken, channel);

    await chatRepository.saveMessage(conversation.id, 'user', userText);

    const recentMessages = await chatRepository.getRecentMessages(conversation.id, 10);
    const history: ChatMessage[] = recentMessages
      .slice(0, -1)
      .map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

    let replyText: string;
    try {
      replyText = await generateReply(history, userText);
    } catch (err) {
      if (err instanceof LLMContentFilterError) {
        replyText = "I'm not able to respond to that. Is there something else I can help you with?";
      } else {
        throw err;
      }
    }

    const aiMessage = await chatRepository.saveMessage(conversation.id, 'ai', replyText);

    return {
      reply: replyText,
      sessionId: conversation.session_token,
      messageId: aiMessage.id,
    };
  }

  async getHistory(
    sessionToken: string,
    limit: number,
    before?: string
  ): Promise<GetHistoryResult> {
    const conversation = await chatRepository.findConversationByToken(sessionToken);
    if (!conversation) {
      return {
        sessionId: sessionToken,
        messages: [],
        pagination: { hasMore: false, nextCursor: null },
      };
    }

    const { messages, hasMore, nextCursor } = await chatRepository.getMessageHistory(
      conversation.id,
      limit,
      before
    );

    return {
      sessionId: conversation.session_token,
      messages: messages.map((m) => ({
        id: m.id,
        sender: m.sender,
        text: m.text,
        createdAt: m.created_at.toISOString(),
      })),
      pagination: { hasMore, nextCursor },
    };
  }
}

export const chatService = new ChatService();
