import { useState, useCallback, useRef, useEffect } from 'react';
import { chatAPI, Message } from '../api/chat.api';

export const SESSION_KEY = 'spur_session_id';
const TYPING_DELAY = 300;

export interface UIMessage extends Message {
  isError?: boolean;
}

export interface ChatState {
  messages: UIMessage[];
  sessionId: string | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  isTyping: boolean;
  hasMore: boolean;
  nextCursor: string | null;
  error: string | null;
}

export function useChat() {
  const [state, setState] = useState<ChatState>({
    messages: [],
    sessionId: null,
    isLoading: false,
    isLoadingMore: false,
    isTyping: false,
    hasMore: false,
    nextCursor: null,
    error: null,
  });

  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialized = useRef(false);

  const set = useCallback((patch: Partial<ChatState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const loadHistory = useCallback(async () => {
    const storedId = localStorage.getItem(SESSION_KEY);
    if (!storedId) return;

    set({ sessionId: storedId });
    try {
      const data = await chatAPI.getHistory(storedId, 20);
      if (data.messages.length === 0) {
        localStorage.removeItem(SESSION_KEY);
        set({ sessionId: null, messages: [] });
        return;
      }
      setState((prev) => ({
        ...prev,
        messages: data.messages,
        hasMore: data.pagination.hasMore,
        nextCursor: data.pagination.nextCursor,
      }));
    } catch {
      localStorage.removeItem(SESSION_KEY);
      set({ sessionId: null, messages: [] });
    }
  }, [set]);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      loadHistory();
    }
  }, [loadHistory]);

  const loadMore = useCallback(async () => {
    if (!state.sessionId || !state.hasMore || !state.nextCursor || state.isLoadingMore) return;

    set({ isLoadingMore: true });
    try {
      const data = await chatAPI.getHistory(state.sessionId, 20, state.nextCursor);
      setState((prev) => ({
        ...prev,
        messages: [...data.messages, ...prev.messages],
        hasMore: data.pagination.hasMore,
        nextCursor: data.pagination.nextCursor,
        isLoadingMore: false,
      }));
    } catch {
      set({ isLoadingMore: false });
    }
  }, [state.sessionId, state.hasMore, state.nextCursor, state.isLoadingMore, set]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || state.isLoading) return;

      const tempUserMsg: UIMessage = {
        id: `temp-${Date.now()}`,
        sender: 'user',
        text: trimmed,
        createdAt: new Date().toISOString(),
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, tempUserMsg],
        isLoading: true,
        error: null,
      }));

      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        set({ isTyping: true });
      }, TYPING_DELAY);

      try {
        const data = await chatAPI.sendMessage(trimmed, state.sessionId ?? undefined);

        if (!state.sessionId) {
          localStorage.setItem(SESSION_KEY, data.sessionId);
        }

        const aiMsg: UIMessage = {
          id: data.messageId,
          sender: 'ai',
          text: data.reply,
          createdAt: new Date().toISOString(),
        };

        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, aiMsg],
          sessionId: data.sessionId,
          isLoading: false,
          isTyping: false,
        }));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Something went wrong.';
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isTyping: false,
          error: message,
        }));
      } finally {
        if (typingTimerRef.current) {
          clearTimeout(typingTimerRef.current);
          typingTimerRef.current = null;
        }
      }
    },
    [state.isLoading, state.sessionId, set]
  );

  const clearError = useCallback(() => set({ error: null }), [set]);

  const startNewChat = useCallback(() => {
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    localStorage.removeItem(SESSION_KEY);
    setState({
      messages: [],
      sessionId: null,
      isLoading: false,
      isLoadingMore: false,
      isTyping: false,
      hasMore: false,
      nextCursor: null,
      error: null,
    });
  }, []);

  return { state, sendMessage, loadMore, clearError, startNewChat };
}
