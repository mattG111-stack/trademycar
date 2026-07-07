import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

/**
 * Storage for analytics events + leads, using Node's built-in SQLite
 * (zero native deps; Node >= 22 required — see package.json engines).
 *
 * The DB lives at ./data/trademycar.db. That's perfect for a VPS /
 * Docker / long-running host. If you deploy to a serverless platform
 * (e.g. Vercel), the filesystem is ephemeral — swap this module for
 * Postgres/Turso; the rest of the app only talks to the functions
 * exported here.
 */

const DATA_DIR = path.join(process.cwd(), "data");

let db: DatabaseSync | null = null;

function getDb(): DatabaseSync {
  if (db) return db;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  db = new DatabaseSync(path.join(DATA_DIR, "trademycar.db"));
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      event TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_events_event ON events(event);
    CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id);
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      session_id TEXT,
      plate TEXT,
      name TEXT,
      phone TEXT,
      email TEXT,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  return db;
}

/** Funnel stages, in order. Keep in sync with client tracking. */
export const FUNNEL_STAGES = [
  { event: "visit", label: "Visited the site" },
  { event: "flow_started", label: "Entered a plate" },
  { event: "vehicle_confirmed", label: "Confirmed their car" },
  { event: "contact_completed", label: "Left contact details" },
  { event: "offer_step_completed", label: "Passed the trade-in step" },
  { event: "submitted", label: "Submitted (lead!)" },
] as const;

const VALID_EVENTS = new Set(FUNNEL_STAGES.map((s) => s.event));

export function recordEvent(sessionId: string, event: string) {
  if (!VALID_EVENTS.has(event as (typeof FUNNEL_STAGES)[number]["event"]))
    return;
  getDb()
    .prepare("INSERT INTO events (session_id, event) VALUES (?, ?)")
    .run(sessionId, event);
}

export function saveLead(lead: {
  id: string;
  sessionId: string;
  plate: string;
  name: string;
  phone: string;
  email: string;
  payload: unknown;
}) {
  getDb()
    .prepare(
      `INSERT INTO leads (id, session_id, plate, name, phone, email, payload)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      lead.id,
      lead.sessionId,
      lead.plate,
      lead.name,
      lead.phone,
      lead.email,
      JSON.stringify(lead.payload),
    );
}

export type FunnelRow = {
  event: string;
  label: string;
  sessions: number;
  /** % of the previous stage that made it here (100 for the first stage). */
  stepRate: number | null;
  /** % of stage-1 sessions that made it here. */
  overallRate: number | null;
};

export type LeadRow = {
  id: string;
  plate: string;
  name: string;
  phone: string;
  email: string;
  createdAt: string;
  vehicle: {
    make?: string;
    model?: string;
    spec?: string;
    year?: string;
    km?: string;
    fuel?: string;
    drive?: string;
  } | null;
  finance: string;
  offerAmount: string;
  offerDealer: string;
  /** Uploaded files in data/uploads/<id>/ — photos + offer document. */
  files: { name: string; isImage: boolean; isOfferDoc: boolean }[];
};

export type DashboardStats = {
  funnel: FunnelRow[];
  totalVisits: number;
  totalLeads: number;
  conversionRate: number | null;
  visitsByDay: { day: string; visits: number; leads: number }[];
  leads: LeadRow[];
};

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|heic|heif|avif)$/i;

function listLeadFiles(leadId: string): LeadRow["files"] {
  try {
    return fs
      .readdirSync(path.join(DATA_DIR, "uploads", leadId))
      .map((name) => ({
        name,
        isImage: IMAGE_EXT.test(name),
        isOfferDoc: name.startsWith("offerDocument__"),
      }));
  } catch {
    return [];
  }
}

export function getDashboardStats(sinceDays: number | null): DashboardStats {
  const d = getDb();
  const where = sinceDays
    ? `AND created_at >= datetime('now', '-${Math.floor(sinceDays)} days')`
    : "";

  const countStmt = d.prepare(
    `SELECT COUNT(DISTINCT session_id) AS n FROM events WHERE event = ? ${where}`,
  );

  const counts = FUNNEL_STAGES.map(
    (s) => (countStmt.get(s.event) as { n: number }).n,
  );
  const base = counts[0] || 0;

  const funnel: FunnelRow[] = FUNNEL_STAGES.map((s, i) => ({
    event: s.event,
    label: s.label,
    sessions: counts[i],
    stepRate:
      i === 0
        ? null
        : counts[i - 1] > 0
          ? Math.round((counts[i] / counts[i - 1]) * 1000) / 10
          : null,
    overallRate:
      i === 0
        ? null
        : base > 0
          ? Math.round((counts[i] / base) * 1000) / 10
          : null,
  }));

  const visitsByDay = d
    .prepare(
      `SELECT date(created_at) AS day,
              COUNT(DISTINCT CASE WHEN event = 'visit' THEN session_id END) AS visits,
              COUNT(DISTINCT CASE WHEN event = 'submitted' THEN session_id END) AS leads
       FROM events
       WHERE created_at >= datetime('now', '-14 days')
       GROUP BY day ORDER BY day DESC`,
    )
    .all() as { day: string; visits: number; leads: number }[];

  // Every lead, newest first (capped at 500 rows to keep the page snappy —
  // raise or paginate if volume ever warrants it).
  const leadRows = d
    .prepare(
      `SELECT id, plate, name, phone, email, payload, created_at AS createdAt
       FROM leads ORDER BY created_at DESC LIMIT 500`,
    )
    .all() as {
    id: string;
    plate: string;
    name: string;
    phone: string;
    email: string;
    payload: string;
    createdAt: string;
  }[];

  const leads: LeadRow[] = leadRows.map((l) => {
    let p: Record<string, unknown> = {};
    try {
      p = JSON.parse(l.payload);
    } catch {
      /* keep empty */
    }
    return {
      id: l.id,
      plate: l.plate,
      name: l.name,
      phone: l.phone,
      email: l.email,
      createdAt: l.createdAt,
      vehicle: (p.vehicle as LeadRow["vehicle"]) ?? null,
      finance: String(p.finance ?? ""),
      offerAmount: String(p.offerAmount ?? ""),
      offerDealer: String(p.offerDealer ?? ""),
      files: listLeadFiles(l.id),
    };
  });

  const totalVisits = base;
  const totalLeads = counts[counts.length - 1];

  return {
    funnel,
    totalVisits,
    totalLeads,
    conversionRate:
      totalVisits > 0
        ? Math.round((totalLeads / totalVisits) * 1000) / 10
        : null,
    visitsByDay,
    leads,
  };
}
