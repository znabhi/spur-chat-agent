# Spur AI Chat Agent

A mini AI customer support agent for a live chat widget — built for the Spur Founding Full-Stack Engineer take-home assignment.

**Live demo:** [https://spur-chat-agent-uaok.onrender.com/](https://spur-chat-agent-uaok.onrender.com/)

**Video walkthrough:** [Watch Loom Video Demo](https://www.loom.com/share/84eabbbc7a0144209930f48e30ded4d8)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + TypeScript + Express |
| Frontend | React 18 + Vite + TypeScript |
| Database | PostgreSQL |
| LLM | Groq (llama-3.3-70b-versatile) via OpenAI-compatible SDK |
| Styling | Vanilla CSS (CSS custom properties / design tokens) |

---

## How to Run Locally (Step-by-Step)

### Prerequisites

- **Node.js** ≥ 18
- **PostgreSQL** ≥ 14 running locally
- A **Groq API key** (free at [console.groq.com](https://console.groq.com))

---

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd spur-chat-agent
```

---

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
```

Open `.env` and fill in your values (see [Environment Variables](#environment-variables) below).

```bash
npm install
```

#### Create the Database

```bash
# Create the database (run once)
createdb spur_chat -U postgres

# Or using psql:
psql -U postgres -c "CREATE DATABASE spur_chat;"
```

#### Run Migrations

```bash
npm run db:migrate
```

Expected output:
```
[migrate] Running migrations...
[migrate] ✅ Migration complete
```

#### Seed FAQ Data

```bash
npm run db:seed
```

Expected output:
```
[seed] Seeding FAQ data...
[seed] ✅ Seeded 12 FAQ entries
```

#### Start the Backend

```bash
npm run dev
```

Expected output:
```
[startup] ✅ Environment validated
🚀 Spur Chat Agent running
   Local:   http://localhost:3001
   Health:  http://localhost:3001/health
   Env:     development
```

---

### 3. Frontend Setup

Open a **new terminal tab**:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Expected output:
```
  ➜  Local:   http://localhost:3000/
```

Open `http://localhost:3000` in your browser.

---

### 4. Verify Everything Works

```bash
curl http://localhost:3001/health
# {"status":"ok","db":"connected","uptime":5,"timestamp":"..."}
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `GROQ_API_KEY` | ✅ | — | Your Groq API key from console.groq.com |
| `DATABASE_URL` | ✅ | — | PostgreSQL connection string |
| `PORT` | No | `3001` | Backend server port |
| `NODE_ENV` | No | `development` | `development` or `production` |
| `CORS_ORIGIN` | No | `http://localhost:3000` | Frontend origin for CORS |
| `LLM_PROVIDER` | No | `groq` | LLM backend (`groq` only for now) |
| `MAX_TOKENS` | No | `500` | Max tokens per LLM response |
| `HISTORY_LIMIT` | No | `10` | Number of past messages sent as LLM context |

### Frontend (`frontend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | No | `http://localhost:3001` | Backend API base URL |

> **Note:** In development, Vite proxies `/chat` and `/health` to the backend automatically — you don't need `VITE_API_URL` for local development.

---

## DB Migration & Seed Reference

```bash
cd backend

# Run SQL migrations (creates tables, indexes, trigger)
npm run db:migrate

# Seed FAQ knowledge base (12 entries across 6 categories)
npm run db:seed
```

Both commands are idempotent and safe to re-run.

---

## Architecture Overview

```
spur-chat-agent/
├── backend/
│   └── src/
│       ├── config/env.ts             # Centralised env config + startup validation
│       ├── features/chat/            # Chat feature (vertical slice)
│       │   ├── chat.routes.ts        # Route definitions
│       │   ├── chat.controller.ts    # Request handlers (thin, delegates to service)
│       │   ├── chat.service.ts       # Business logic orchestrator
│       │   ├── chat.repository.ts    # All DB queries
│       │   └── chat.types.ts         # Zod input schemas + inferred TypeScript types
│       ├── llm/                      # LLM abstraction layer
│       │   ├── llm.provider.ts       # LLMProvider interface (Strategy Pattern)
│       │   ├── groq.provider.ts      # Groq implementation
│       │   ├── llm.service.ts        # generateReply() — public API for chat.service
│       │   └── prompt.builder.ts     # System prompt builder
│       ├── faq/                      # Knowledge base module
│       │   ├── faq.repository.ts     # Reads faq_entries from DB
│       │   └── faq.cache.ts          # In-memory 5-min TTL cache
│       ├── adapters/                 # Channel abstraction (for future multi-channel)
│       │   ├── channel.adapter.ts    # ChannelAdapter interface
│       │   └── web-chat.adapter.ts   # Web chat implementation
│       ├── middleware/               # Express middleware
│       │   ├── error.middleware.ts   # Global error handler
│       │   ├── logger.middleware.ts  # Request logger
│       │   └── validate.middleware.ts# Generic Zod schema validator
│       ├── types/errors.ts           # Typed AppError subclasses
│       └── db/
│           ├── client.ts             # pg Pool singleton
│           ├── migrate.ts            # Migration runner
│           ├── seed.ts               # FAQ seeder
│           └── migrations/001_init.sql
│
└── frontend/
    └── src/
        ├── api/chat.api.ts           # API client with typed errors
        ├── hooks/useChat.ts          # All chat state, session, pagination
        └── components/
            ├── ChatWidget.tsx        # Root widget (header + messages + input)
            ├── MessageBubble.tsx     # User/AI message bubble
            ├── InputBar.tsx          # Textarea + send button + char counter
            ├── TypingIndicator.tsx   # Animated 3-dot indicator
            ├── EmptyState.tsx        # Welcome screen with quick-question chips
            ├── ErrorToast.tsx        # Auto-dismissing error notification
            └── LoadMoreButton.tsx    # Cursor-based "load older messages"
```

### Key Design Decisions

**Layered architecture (backend):**
Routes → Controller → Service → Repository is a classic, readable pattern. Each layer has exactly one responsibility. Adding a new feature (e.g., a `/tickets` endpoint) means adding files in a new `features/tickets/` folder — zero changes to existing code.

**Strategy Pattern for LLM providers:**
`LLMProvider` is an interface. `GroqProvider` implements it. Switching to OpenAI or Anthropic = create a new `openai.provider.ts` file + change one env var. `ChatService` never knows which provider is active.

**Channel Adapter Pattern:**
`ChannelAdapter` interface abstracts how messages arrive (web, WhatsApp, Instagram). Adding WhatsApp = create `whatsapp.adapter.ts` + one new route file. `ChatService` and `LLMService` stay completely unchanged.

**User message saved BEFORE LLM call:**
If the LLM times out or errors, the user's message is still persisted in the DB. The error is surfaced as a clean UI toast. No silent data loss.

**FAQ knowledge base in DB (not hardcoded):**
FAQ entries live in `faq_entries` table. Updating knowledge = one SQL UPDATE; no redeployment needed. A 5-minute in-memory cache means only one DB hit per 5 minutes regardless of traffic.

**Cursor-based pagination:**
The "load older messages" uses keyset pagination (`WHERE created_at < $cursor`) rather than `OFFSET`. This is O(log n) and stays fast as conversations grow long.

---

## LLM Notes

**Provider:** Groq — [console.groq.com](https://console.groq.com)

**Why Groq:**
- Free API key with generous limits
- Uses the same OpenAI SDK (`baseURL` override) — swapping to OpenAI is 2 lines of code
- Extremely fast inference (sub-2s responses typical)

**Model:** `llama-3.3-70b-versatile`
- Strong instruction-following, good for support agent persona
- 128k context window (far more than needed)

**Prompting strategy:**
1. A system prompt establishes the agent persona ("Aria"), rules (no invented policies, 1-3 paragraphs, always offer follow-up), and injects the live FAQ context from the DB.
2. The last 10 conversation turns are included as `messages[]` history so replies are contextual.
3. `temperature: 0.4` — slightly creative but focused; avoids robotic repetition without hallucinating policies.
4. `max_tokens: 500` — caps cost per reply; configurable via `MAX_TOKENS` env var.

**Error guardrails:**
| Error | HTTP Status | User Message |
|---|---|---|
| Timeout / ETIMEDOUT | 503 | "Our support agent is a bit slow right now. Please try again in a moment." |
| Rate limit (429) | 429 | "Too many requests. Please wait a moment and try again." |
| Invalid key (401/403) | 500 | "Our AI agent is currently unavailable. Please try again later." |
| Content filter (400) | 422 | "I'm not able to respond to that. Can I help you with something else?" |

---

## Trade-offs & "If I Had More Time…"

### Things I deliberately kept simple
- **No auth:** The assignment explicitly says no login required. `sessionId` in `localStorage` is enough for the use case.
- **Single migration file:** For an 8-12hr assignment, one `001_init.sql` is the right tradeoff over a full migration framework like Flyway.
- **Groq only:** The Strategy pattern makes it trivial to add OpenAI/Anthropic — I just didn't add providers that aren't needed.

### If I had more time
- **WebSocket / SSE for streaming:** Replace request/response with streaming so the AI reply types out word-by-word, which is dramatically better UX.
- **Rate limiting middleware:** Add `express-rate-limit` per IP to prevent abuse.
- **Redis cache for FAQs:** Replace the in-memory cache with Redis so FAQ updates propagate across multiple backend instances instantly.
- **WhatsApp adapter:** The `ChannelAdapter` pattern is already in place — adding WhatsApp would be ~50 lines of code.
- **Unit + integration tests:** Jest + Supertest for the backend; Vitest for the frontend hook.
- **Message search:** Full-text search on `messages.text` using PostgreSQL `tsvector`.
- **Admin panel:** View all conversations, edit FAQ entries, monitor LLM token usage.
- **Docker Compose:** One `docker-compose up` to start Postgres + backend + frontend — much easier onboarding.

---

## API Reference

### `POST /chat/message`

Send a user message and get an AI reply.

**Request:**
```json
{
  "message": "What is your return policy?",
  "sessionId": "optional-uuid-from-previous-response"
}
```

**Response:**
```json
{
  "reply": "We offer hassle-free 30-day returns...",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "messageId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
}
```

**Errors:**
- `400` — Empty message, message > 4000 chars, invalid sessionId format
- `429` — LLM rate limit
- `503` — LLM timeout or DB unavailable

---

### `GET /chat/:sessionId/history`

Fetch message history for a session (cursor-based pagination).

**Query params:**
- `limit` (optional, default 20, max 100)
- `before` (optional) — ISO timestamp cursor for loading older messages

**Response:**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "messages": [
    {
      "id": "...",
      "sender": "user",
      "text": "What is your return policy?",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": "...",
      "sender": "ai",
      "text": "We offer hassle-free 30-day returns...",
      "createdAt": "2024-01-15T10:30:02.000Z"
    }
  ],
  "pagination": {
    "hasMore": false,
    "nextCursor": null
  }
}
```

---

### `GET /health`

```json
{
  "status": "ok",
  "db": "connected",
  "uptime": 42,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```
