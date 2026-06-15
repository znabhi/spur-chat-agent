const API_BASE = import.meta.env.VITE_API_URL || '';

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  createdAt: string;
}

export interface SendMessageResponse {
  reply: string;
  sessionId: string;
  messageId: string;
}

export interface GetHistoryResponse {
  sessionId: string;
  messages: Message[];
  pagination: {
    hasMore: boolean;
    nextCursor: string | null;
  };
}

export interface APIError {
  error: string;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as APIError).error || 'An unexpected error occurred.');
  }
  return data as T;
}

export const chatAPI = {
  sendMessage: async (message: string, sessionId?: string): Promise<SendMessageResponse> => {
    const res = await fetch(`${API_BASE}/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, sessionId }),
    });
    return handleResponse<SendMessageResponse>(res);
  },

  getHistory: async (
    sessionId: string,
    limit = 20,
    before?: string
  ): Promise<GetHistoryResponse> => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (before) params.set('before', before);
    const res = await fetch(`${API_BASE}/chat/${sessionId}/history?${params}`);
    return handleResponse<GetHistoryResponse>(res);
  },
};
