// ---------------------------------------------------------------------------
// Instantly (cold-email) integration — adapter pattern, same shape as
// ai-service.ts. MockInstantlyService is the wired default and simulates an
// idempotent webhook: replaying the same externalId is a documented no-op
// against the integrationEvents ledger, mirroring how a real webhook
// endpoint must behave (providers retry deliveries).
//
// A real InstantlyService would receive actual webhook POSTs on a server
// route (never in the browser — no client-side webhook receivers exist),
// verify a signing secret, and call the same applyIntegrationEvent()
// reducer used here. That reducer is provider-agnostic on purpose.
// ---------------------------------------------------------------------------
import type { IntegrationEvent } from "@/types";
import { uid, nowIso } from "@/lib/storage";

export interface SimulatedWebhookInput {
  relationshipId: string;
  eventType: IntegrationEvent["eventType"];
  campaign: string;
  step: number;
}

export interface InstantlyService {
  readonly label: "Mock Instantly" | "Instantly";
  simulateWebhook(input: SimulatedWebhookInput): IntegrationEvent;
}

/**
 * Idempotency check: given a candidate event and the existing ledger, returns
 * true if this exact external event has already been processed and should be
 * skipped. Matches on externalId exactly, the same key a real webhook
 * endpoint would dedupe on.
 */
export function isDuplicateEvent(externalId: string, existing: IntegrationEvent[]): boolean {
  return existing.some((e) => e.externalId === externalId);
}

class MockInstantlyService implements InstantlyService {
  readonly label = "Mock Instantly" as const;
  private counter = 0;

  simulateWebhook(input: SimulatedWebhookInput): IntegrationEvent {
    this.counter += 1;
    return {
      id: uid("ie"),
      provider: "Instantly",
      eventType: input.eventType,
      relationshipId: input.relationshipId,
      externalId: `instantly_sim_${input.campaign.replace(/\s+/g, "_").toLowerCase()}_${input.step}_${this.counter}`,
      payload: { campaign: input.campaign, step: input.step, simulated: true },
      processedAt: nowIso(),
    };
  }
}

let cached: InstantlyService | null = null;

export function getInstantlyService(): InstantlyService {
  if (cached) return cached;
  // Real provider intentionally not implemented client-side — see header.
  cached = new MockInstantlyService();
  return cached;
}
