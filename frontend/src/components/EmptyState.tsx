interface Props {
  onChipClick: (text: string) => void;
}

const STARTERS = [
  { icon: '📦', text: "What's your return policy?" },
  { icon: '🚚', text: 'Do you ship internationally?' },
  { icon: '🔍', text: 'How do I track my order?' },
  { icon: '💳', text: 'What payment methods do you accept?' },
];

export function EmptyState({ onChipClick }: Props) {
  return (
    <div className="empty-state">
      <div className="empty-icon">🌸</div>

      <h2 className="empty-title">Hi! I'm Aria ✨</h2>
      <p className="empty-subtitle">
        Bloom &amp; Basket's AI support assistant.<br />
        Ask me anything about orders, returns, or shipping.
      </p>

      <p className="chips-label">Quick questions</p>
      <div className="chips-grid">
        {STARTERS.map(({ icon, text }) => (
          <button
            key={text}
            onClick={() => onChipClick(text)}
            className="chip-btn"
          >
            <span className="chip-icon">{icon}</span>
            <span className="chip-text">{text}</span>
            <span className="chip-arrow">→</span>
          </button>
        ))}
      </div>
    </div>
  );
}
