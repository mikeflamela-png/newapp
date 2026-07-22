// ---------------------------------------------------------------------------
// AI Service — adapter pattern.
// MockAIService is fully wired up and is the default (VITE_AI_PROVIDER unset
// or "mock"). It is deterministic, offline, and every output is prefixed so
// the UI can render a clear "Simulated AI" label — this app never presents
// mock output as if it were a real model response.
//
// OpenAIService below is a DOCUMENTED STUB ONLY — it is intentionally not
// wired into getAIService() by default, and it deliberately throws if
// selected without a key, rather than silently falling back. To actually use
// it in a real deployment:
//   1. Never call the OpenAI API directly from client-side code with a real
//      key — VITE_ prefixed env vars are inlined into the public bundle.
//   2. Stand up a small server route (e.g. a Vercel Serverless Function at
//      /api/ai/*) that holds the real OPENAI_API_KEY server-side only.
//   3. Point OpenAIService's fetch calls at that route instead of directly
//      at api.openai.com, and remove VITE_OPENAI_API_KEY entirely.
// This file draws that boundary explicitly so it's never accidentally
// crossed.
// ---------------------------------------------------------------------------
import type { RelationshipMemory } from "@/types";

export interface AISummaryRequest {
  contactName: string;
  companyName: string;
  recentActivitySummaries: string[];
  existingMemories: RelationshipMemory["note"][];
}

export interface AIService {
  readonly label: "Simulated AI" | "OpenAI";
  summarizeRelationship(req: AISummaryRequest): Promise<string>;
  extractContextFromNotes(rawNotes: string): Promise<string[]>;
  suggestNextMessage(req: AISummaryRequest): Promise<string>;
}

class MockAIService implements AIService {
  readonly label = "Simulated AI" as const;

  async summarizeRelationship(req: AISummaryRequest): Promise<string> {
    await delay();
    const touchCount = req.recentActivitySummaries.length;
    const contextNote = req.existingMemories[0];
    return [
      `Simulated AI summary: ${req.contactName} at ${req.companyName} has had ${touchCount} recent touch(es).`,
      contextNote ? `Notable context: ${contextNote}` : "No personal context logged yet — consider an AI Context Interview.",
    ].join(" ");
  }

  async extractContextFromNotes(rawNotes: string): Promise<string[]> {
    await delay();
    // Deterministic "extraction": split on sentence boundaries and tag each
    // as a simulated insight. A real adapter would call an LLM for this.
    return rawNotes
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => `Simulated AI insight: ${s}`);
  }

  async suggestNextMessage(req: AISummaryRequest): Promise<string> {
    await delay();
    return `Simulated AI draft: Hi ${req.contactName.split(" ")[0]} — following up on our last conversation at ${req.companyName}. Wanted to keep this moving on my end; happy to send over anything that's useful this week.`;
  }
}

function delay(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class OpenAIService implements AIService {
  readonly label = "OpenAI" as const;

  async summarizeRelationship(): Promise<string> {
    throw new Error(
      "OpenAIService is a documented stub. Wire a server-side proxy route before enabling this adapter — see the header comment in src/lib/ai-service.ts.",
    );
  }
  async extractContextFromNotes(): Promise<string[]> {
    throw new Error("OpenAIService is a documented stub — see src/lib/ai-service.ts.");
  }
  async suggestNextMessage(): Promise<string> {
    throw new Error("OpenAIService is a documented stub — see src/lib/ai-service.ts.");
  }
}

let cachedService: AIService | null = null;

export function getAIService(): AIService {
  if (cachedService) return cachedService;
  const provider = import.meta.env.VITE_AI_PROVIDER ?? "mock";
  cachedService = provider === "openai" ? new OpenAIService() : new MockAIService();
  return cachedService;
}
