// ---------------------------------------------------------------------------
// Local persistence layer.
// Everything lives in localStorage under one versioned root key so the whole
// app state can be exported/imported/reset as a single JSON document.
// This is the ONLY place that talks to localStorage — every other module
// goes through the functions below.
// ---------------------------------------------------------------------------
import { useSyncExternalStore } from "react";
import type {
  Activity,
  Company,
  CompanyIntelligence,
  Contact,
  DailyProgress,
  IntegrationEvent,
  Message,
  Production,
  Recommendation,
  Relationship,
  RelationshipAsset,
  RelationshipMemory,
  RelationshipProductionMatch,
  ScoreSnapshot,
  Task,
  UserSettings,
} from "@/types";
import { seedDatabase } from "@/lib/seed-data";

const STORAGE_KEY = "relationship-leaderboard.db.v1";
export const SCHEMA_VERSION = 1;

export interface Database {
  schemaVersion: number;
  companies: Company[];
  contacts: Contact[];
  relationships: Relationship[];
  memories: RelationshipMemory[];
  intelligence: CompanyIntelligence[];
  activities: Activity[];
  tasks: Task[];
  productions: Production[];
  productionMatches: RelationshipProductionMatch[];
  assets: RelationshipAsset[];
  scoreSnapshots: ScoreSnapshot[];
  recommendations: Recommendation[];
  integrationEvents: IntegrationEvent[];
  messages: Message[];
  dailyProgress: DailyProgress[];
  settings: UserSettings;
}

function defaultSettings(): UserSettings {
  return {
    displayName: "Mike Flores",
    email: "mikeflame.la@gmail.com",
    theme: "system",
    dailyTouchGoal: 8,
    aiProvider: "mock",
    instantlyProvider: "mock",
    notificationsEnabled: true,
    gamificationEnabled: true,
  };
}

function freshDatabase(): Database {
  return {
    schemaVersion: SCHEMA_VERSION,
    ...seedDatabase(),
    settings: defaultSettings(),
  };
}

function read(): Database {
  if (typeof window === "undefined") return freshDatabase();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const fresh = freshDatabase();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      return fresh;
    }
    const parsed = JSON.parse(raw) as Database;
    if (parsed.schemaVersion !== SCHEMA_VERSION) {
      // Simple migration strategy: reseed on schema bump, preserving nothing.
      // Documented in README as the current migration approach.
      const fresh = freshDatabase();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      return fresh;
    }
    return parsed;
  } catch {
    return freshDatabase();
  }
}

let cache: Database = read();
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    /* quota exceeded — swallow, surfaced separately in Settings */
  }
}

export function getDb(): Database {
  return cache;
}

export function updateDb(mutator: (db: Database) => Database): Database {
  cache = mutator(cache);
  persist();
  emit();
  return cache;
}

export function resetDemoData(): Database {
  cache = freshDatabase();
  persist();
  emit();
  return cache;
}

export function exportDb(): string {
  return JSON.stringify(cache, null, 2);
}

export function importDb(json: string): { ok: true } | { ok: false; error: string } {
  try {
    const parsed = JSON.parse(json) as Database;
    if (typeof parsed !== "object" || parsed === null || !Array.isArray(parsed.companies)) {
      return { ok: false, error: "File does not look like a Relationship Leaderboard export." };
    }
    cache = { ...freshDatabase(), ...parsed, schemaVersion: SCHEMA_VERSION };
    persist();
    emit();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown parse error." };
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return cache;
}

function getServerSnapshot(): Database {
  return freshDatabase();
}

/** Subscribes a component to the entire local database. Re-renders on any write. */
export function useDb(): Database {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}
