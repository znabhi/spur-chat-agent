import { getAllActiveFAQs, FAQEntry } from './faq.repository';

// In-memory cache with 5-minute TTL
// On cold start (serverless), re-fetched from DB automatically
interface CacheEntry {
  data: FAQEntry[];
  expiresAt: number;
}

let cache: CacheEntry | null = null;
const TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function getCachedFAQs(): Promise<FAQEntry[]> {
  const now = Date.now();

  if (cache && cache.expiresAt > now) {
    return cache.data;
  }

  const data = await getAllActiveFAQs();
  cache = { data, expiresAt: now + TTL_MS };
  console.log(`[faq-cache] Refreshed — ${data.length} entries loaded`);
  return data;
}

export function buildFAQContext(faqs: FAQEntry[]): string {
  if (faqs.length === 0) return 'No FAQ data available.';

  const grouped = faqs.reduce<Record<string, FAQEntry[]>>((acc, faq) => {
    if (!acc[faq.category]) acc[faq.category] = [];
    acc[faq.category].push(faq);
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([category, entries]) => {
      const lines = entries.map((e) => `Q: ${e.question}\nA: ${e.answer}`).join('\n\n');
      return `[${category}]\n${lines}`;
    })
    .join('\n\n---\n\n');
}
