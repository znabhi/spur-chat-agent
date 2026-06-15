import { UIMessage } from '../hooks/useChat';

interface Props {
  message: UIMessage;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function MessageBubble({ message }: Props) {
  const isUser = message.sender === 'user';

  return (
    <div
      className={`message-row ${isUser ? 'message-row--user' : 'message-row--ai'}`}
    >
      {/* AI Avatar — top-aligned */}
      {!isUser && (
        <div
          aria-hidden="true"
          className="message-avatar"
        >
          🌸
        </div>
      )}

      <div className={`message-body ${isUser ? 'message-body--user' : 'message-body--ai'}`}>
        {!isUser && (
          <span className="message-sender">Aria</span>
        )}

        <div
          className={`message-bubble ${isUser ? 'message-bubble--user' : 'message-bubble--ai'}`}
        >
          {message.text}
        </div>

        <span className={`message-time ${isUser ? 'message-time--user' : ''}`}>
          {formatTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
}
