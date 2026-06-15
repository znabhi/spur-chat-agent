interface Props {
  visible: boolean;
}

export function TypingIndicator({ visible }: Props) {
  if (!visible) return null;

  return (
    <div
      role="status"
      aria-label="Agent is typing"
      className="typing-row"
    >
      {/* Avatar */}
      <div
        className="message-avatar"
        aria-hidden="true"
        style={{ marginTop: 0 }}
      >
        🌸
      </div>

      <div className="typing-bubble">
        {[0, 160, 320].map((delay) => (
          <span
            key={delay}
            className="typing-dot"
            style={{ animation: `bounce 1.2s ${delay}ms infinite` }}
          />
        ))}
      </div>
    </div>
  );
}
