import { useState, useRef, KeyboardEvent } from 'react';

const MAX_CHARS = 4000;
const WARN_AT = 3800;

interface Props {
  onSend: (text: string) => void;
  disabled: boolean;
}

export function InputBar({ onSend, disabled }: Props) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const charCount = text.length;
  const isOverLimit = charCount > MAX_CHARS;
  const isWarn = charCount >= WARN_AT;
  const canSend = text.trim().length > 0 && !disabled && !isOverLimit;

  const handleSend = () => {
    if (!canSend) return;
    onSend(text);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className="input-bar">
      {isWarn && (
        <div className={`char-counter ${isOverLimit ? 'char-counter--error' : 'char-counter--warn'}`}>
          {charCount}/{MAX_CHARS}
          {isOverLimit && ' — Too long'}
        </div>
      )}

      <div className={`input-row${isOverLimit ? ' input-row--error' : ''}`}>
        <textarea
          ref={textareaRef}
          id="chat-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          disabled={disabled}
          placeholder="Type a message…"
          rows={1}
          aria-label="Message input"
          className="input-textarea"
        />

        <button
          id="send-button"
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Send message"
          className={`send-btn ${canSend ? 'send-btn--active' : 'send-btn--disabled'}`}
        >
          {disabled ? (
            <span className="spinner" />
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          )}
        </button>
      </div>

      <p className="input-hint">Enter to send · Shift + Enter for new line</p>
    </div>
  );
}
