import { ChannelAdapter, IncomingMessage, OutgoingMessage } from './channel.adapter';

export class WebChatAdapter implements ChannelAdapter {
  parseIncoming(rawPayload: unknown): IncomingMessage {
    const payload = rawPayload as { message: string; sessionId?: string };
    return {
      text: payload.message,
      sessionId: payload.sessionId,
      channel: 'web',
    };
  }

  formatOutgoing(reply: string, sessionId: string, messageId: string): OutgoingMessage {
    return { reply, sessionId, messageId };
  }
}
