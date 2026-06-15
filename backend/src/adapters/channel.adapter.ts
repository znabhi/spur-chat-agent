// Channel Adapter Pattern
// WebChatAdapter ships now.
// Adding WhatsApp = create WhatsAppAdapter + 1 new route file.
// ChatService and LLMService stay untouched.

export interface IncomingMessage {
  text: string;
  sessionId?: string;
  channel: string;
}

export interface OutgoingMessage {
  reply: string;
  sessionId: string;
  messageId: string;
}

export interface ChannelAdapter {
  parseIncoming(rawPayload: unknown): IncomingMessage;
  formatOutgoing(reply: string, sessionId: string, messageId: string): OutgoingMessage;
}
