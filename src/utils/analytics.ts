// ── utils/analytics.ts ─────────────────────────────────────────────
// Event tracking system — sends lab activity and survey data to a Google Apps Script webhook

export type EventType =
  | 'lab_started'
  | 'mission_complete'
  | 'lab_changed'
  | 'lab_abandoned'
  | 'lab_completed'
  | 'survey_submitted'
  | 'feedback_submitted';

export interface TrackEventData {
  eventType: EventType;
  scenarioId?: string;
  scenarioName?: string;
  details?: Record<string, unknown>;
}

// Webhook URL from env (Google Apps Script web app)
const WEBHOOK_URL = import.meta.env.VITE_ANALYTICS_WEBHOOK || '';

// In-memory queue for events that fire before the webhook is ready
let queue: TrackEventData[] = [];
let flushing = false;

// Session tracking
const sessionStart = Date.now();
let labStart = 0;

/**
 * Get or create an anonymous session ID.
 * Stored in sessionStorage so it survives page reloads but clears when the tab closes.
 * Format: sess_a3f8c2d1 (8 hex chars)
 */
function getSessionId(): string {
  let sid = sessionStorage.getItem('cyberops-session-id');
  if (!sid) {
    sid = 'sess_' + Math.random().toString(16).slice(2, 10);
    sessionStorage.setItem('cyberops-session-id', sid);
  }
  return sid;
}

/**
 * Record when a lab session starts (for duration calculation).
 */
export function recordLabStart(): void {
  labStart = Date.now();
}

/**
 * Get elapsed time in the current lab session (seconds).
 */
export function getLabDuration(): number {
  if (!labStart) return 0;
  return Math.round((Date.now() - labStart) / 1000);
}

/**
 * Get total session time since page load (seconds).
 */
export function getSessionDuration(): number {
  return Math.round((Date.now() - sessionStart) / 1000);
}

/**
 * Send a tracking event to the analytics webhook.
 * Automatically enriches with sessionId, language and session metadata.
 * Failures are silently ignored — analytics must never break the UX.
 */
export function trackEvent(data: TrackEventData): void {
  if (!WEBHOOK_URL) return;

  const enriched: TrackEventData = {
    ...data,
    details: {
      ...(data.details || {}),
      sessionId: getSessionId(),
      language: getLanguage(),
      sessionDuration: getSessionDuration(),
      ...(labStart ? { labDuration: getLabDuration() } : {}),
    },
  };

  queue.push(enriched);
  if (!flushing) void flushQueue();
}

/**
 * Read current language from localStorage (Zustand persist key).
 * Returns 'unknown' if not set — avoids importing the store.
 */
function getLanguage(): string {
  try {
    const raw = localStorage.getItem('cyberops-store');
    if (raw) {
      const parsed = JSON.parse(raw);
      // Zustand persist stores the partialized state directly
      return parsed.state?.language || parsed.language || 'unknown';
    }
  } catch {
    // ignore
  }
  return 'unknown';
}

async function flushQueue(): Promise<void> {
  flushing = true;
  while (queue.length > 0) {
    const batch = queue.splice(0, 10);
    await Promise.all(batch.map((e) => sendSingle(e)));
  }
  flushing = false;
}

async function sendSingle(data: TrackEventData): Promise<void> {
  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(data),
    });
  } catch {
    // silently drop — analytics must not affect UX
  }
}
