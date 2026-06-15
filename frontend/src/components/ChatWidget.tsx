import { useEffect, useRef, useState, useCallback } from 'react';
import { useChat } from '../hooks/useChat';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { InputBar } from './InputBar';
import { EmptyState } from './EmptyState';
import { LoadMoreButton } from './LoadMoreButton';
import { ErrorToast } from './ErrorToast';

export function ChatWidget() {
  const { state, sendMessage, loadMore, clearError, startNewChat } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [prefillText, setPrefillText] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!showConfirm) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowConfirm(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [showConfirm]);

  useEffect(() => {
    if (!state.isLoadingMore) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [state.messages.length, state.isTyping, state.isLoadingMore]);

  const handleLoadMore = useCallback(async () => {
    const container = scrollContainerRef.current;
    if (!container) { loadMore(); return; }
    const prevScrollHeight = container.scrollHeight;
    await loadMore();
    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight - prevScrollHeight;
    });
  }, [loadMore]);

  const handleSend = useCallback((text: string) => {
    setPrefillText('');
    sendMessage(text);
  }, [sendMessage]);

  const handleChipClick = useCallback((text: string) => {
    setPrefillText(text);
  }, []);

  useEffect(() => {
    if (prefillText) {
      const t = setTimeout(() => {
        sendMessage(prefillText);
        setPrefillText('');
      }, 50);
      return () => clearTimeout(t);
    }
  }, [prefillText, sendMessage]);

  const handleNewChatClick = () => {
    if (state.messages.length > 0) setShowConfirm(true);
    else startNewChat();
  };

  const confirmNewChat = () => {
    setShowConfirm(false);
    startNewChat();
  };

  return (
    <>
      {state.error && <ErrorToast message={state.error} onClose={clearError} />}

      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 32, textAlign: 'center', marginBottom: 12 }}>🔄</div>
            <h3 style={{
              fontSize: 'var(--text-base)', fontWeight: 800, color: 'var(--color-text)',
              textAlign: 'center', marginBottom: 8, letterSpacing: '-0.01em',
            }}>
              Start a new chat?
            </h3>
            <p style={{
              fontSize: 'var(--text-sm)', color: 'var(--color-text-2)',
              textAlign: 'center', marginBottom: 24, lineHeight: 1.6,
            }}>
              Your current conversation will be cleared. Past messages are saved in our system.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="modal-cancel-btn" onClick={() => setShowConfirm(false)}>
                Cancel
              </button>
              <button className="modal-confirm-btn" onClick={confirmNewChat}>
                New Chat
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="chat-widget">
        <header className="chat-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="chat-header-avatar">🌸</div>
            <div>
              <div className="chat-header-name">Bloom &amp; Basket Support</div>
              <div className="chat-header-status">
                <span className="online-dot" />
                <span className="chat-header-status-label">Aria is online</span>
              </div>
            </div>
          </div>

          <button
            id="new-chat-button"
            onClick={handleNewChatClick}
            aria-label="Start a new conversation"
            title="New Chat"
            className="new-chat-btn"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            <span>New Chat</span>
          </button>
        </header>

        <div ref={scrollContainerRef} className="chat-messages">
          <LoadMoreButton
            hasMore={state.hasMore}
            loading={state.isLoadingMore}
            onClick={handleLoadMore}
          />

          {state.messages.length === 0 && !state.isLoadingMore && (
            <EmptyState onChipClick={handleChipClick} />
          )}

          {state.messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          <TypingIndicator visible={state.isTyping} />
          <div ref={messagesEndRef} />
        </div>

        <InputBar onSend={handleSend} disabled={state.isLoading} />
      </div>
    </>
  );
}
