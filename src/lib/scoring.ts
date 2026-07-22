// ---------------------------------------------------------------------------
// Deterministic Scoring Engine.
// Pure functions — no randomness, no AI calls. Every point value below is
// explicit and documented so scores are always explainable to the user.
// Score is 0-100, capped. Priority score is a separate daily-ranking value
// (higher = more urgent to act on today) computed from score + recency +
// risk signals, not the same thing as relationship quality.
// ---------------------------------------------------------------------------
import type { Activity, Relationship, RelationshipMemory, ScoreFactor } from "@/types";
import { clamp, daysBetween } from "@/lib/utils";

const STAGE_POINTS: Record<Relationship["stage"], number> = {
  "Active Client": 25,
  Warm: 20,
  Engaged: 15,
  Contacted: 8,
  Cold: 3,
  Dormant: 5,
  Lost: 0,
};

const MOMENTUM_POINTS: Record<Relationship["momentum"], number> = {
  Accelerating: 15,
  Steady: 10,
  Cooling: 4,
  Stalled: 1,
  "At Risk": 0,
};

const ENGAGEMENT_WEIGHTS: Partial<Record<Activity["type"], number>> = {
  Meeting: 8,
  Call: 6,
  "Email Received": 5,
  "Email Sent": 2,
  "LinkedIn Touch": 2,
  "Event Interaction": 4,
  Note: 1,
  "Production Match": 3,
  "Task Completed": 2,
  "Stage Change": 0,
};

export function computeRecencyPoints(lastContactedAt: string | undefined): { points: number; explanation: string } {
  if (!lastContactedAt) return { points: 0, explanation: "No contact on record" };
  const days = daysBetween(lastContactedAt, new Date().toISOString());
  if (days <= 3) return { points: 20, explanation: `Last touch ${days} day(s) ago` };
  if (days <= 7) return { points: 15, explanation: `Last touch ${days} days ago` };
  if (days <= 14) return { points: 10, explanation: `Last touch ${days} days ago` };
  if (days <= 30) return { points: 5, explanation: `Last touch ${days} days ago` };
  return { points: 0, explanation: `Last touch ${days} days ago — stale` };
}

export function computeEngagementPoints(
  relationshipId: string,
  activities: Activity[],
  windowDays = 21,
): { points: number; explanation: string } {
  const recent = activities.filter(
    (a) => a.relationshipId === relationshipId && daysBetween(a.occurredAt, new Date().toISOString()) <= windowDays,
  );
  const raw = recent.reduce((sum, a) => sum + (ENGAGEMENT_WEIGHTS[a.type] ?? 0), 0);
  const points = clamp(raw, 0, 25);
  return { points, explanation: `${recent.length} touch(es) in last ${windowDays} days` };
}

export function computeContextPoints(
  relationshipId: string,
  memories: RelationshipMemory[],
): { points: number; explanation: string } {
  const count = memories.filter((m) => m.relationshipId === relationshipId).length;
  const points = clamp(count * 3, 0, 15);
  return { points, explanation: `${count} memory note(s) logged` };
}

export function computeScoreFactors(
  relationship: Relationship,
  activities: Activity[],
  memories: RelationshipMemory[],
): ScoreFactor[] {
  const recency = computeRecencyPoints(relationship.lastContactedAt);
  const engagement = computeEngagementPoints(relationship.id, activities);
  const context = computeContextPoints(relationship.id, memories);
  const stagePoints = STAGE_POINTS[relationship.stage];
  const momentumPoints = MOMENTUM_POINTS[relationship.momentum];

  return [
    { key: "recency", label: "Recency of contact", points: recency.points, maxPoints: 20, explanation: recency.explanation },
    { key: "engagement", label: "Engagement depth", points: engagement.points, maxPoints: 25, explanation: engagement.explanation },
    { key: "stage", label: "Stage value", points: stagePoints, maxPoints: 25, explanation: `Stage: ${relationship.stage}` },
    { key: "momentum", label: "Momentum", points: momentumPoints, maxPoints: 15, explanation: `Momentum: ${relationship.momentum}` },
    { key: "context", label: "Human context depth", points: context.points, maxPoints: 15, explanation: context.explanation },
  ];
}

export function computeScore(
  relationship: Relationship,
  activities: Activity[],
  memories: RelationshipMemory[],
): number {
  const factors = computeScoreFactors(relationship, activities, memories);
  const total = factors.reduce((sum, f) => sum + f.points, 0);
  return clamp(Math.round(total), 0, 100);
}

/**
 * Daily priority score: distinct from the quality score above. This answers
 * "who should I act on TODAY", weighting overdue follow-ups and risk of
 * decay heavily, and rewarding high-value relationships that are slipping.
 */
export function computePriorityScore(relationship: Relationship, score: number): number {
  let priority = 0;

  if (relationship.nextFollowUpAt) {
    const overdueDays = daysBetween(relationship.nextFollowUpAt, new Date().toISOString());
    if (overdueDays > 0) priority += clamp(overdueDays * 2, 0, 20);
  }

  if (relationship.momentum === "At Risk") priority += 12;
  if (relationship.momentum === "Cooling") priority += 8;
  if (relationship.momentum === "Stalled") priority += 4;

  if (relationship.stage === "Active Client" || relationship.stage === "Warm") {
    priority += Math.round(score / 10); // high-value relationships nudge up
  }

  if (relationship.stage === "Lost") priority = Math.min(priority, 5); // deprioritize lost, but don't zero out entirely

  return clamp(Math.round(priority), 0, 40);
}

export function recomputeMomentum(
  relationship: Relationship,
  activities: Activity[],
): Relationship["momentum"] {
  const last14 = activities.filter(
    (a) => a.relationshipId === relationship.id && daysBetween(a.occurredAt, new Date().toISOString()) <= 14,
  ).length;
  const last30 = activities.filter(
    (a) => a.relationshipId === relationship.id && daysBetween(a.occurredAt, new Date().toISOString()) <= 30,
  ).length;

  const daysSinceContact = relationship.lastContactedAt
    ? daysBetween(relationship.lastContactedAt, new Date().toISOString())
    : 999;

  if (relationship.stage === "Lost") return "At Risk";
  if (daysSinceContact > 45) return "At Risk";
  if (daysSinceContact > 25) return "Stalled";
  if (last14 >= 2 && last14 >= last30 - last14) return "Accelerating";
  if (last14 >= 1) return "Steady";
  if (last30 >= 1) return "Cooling";
  return "Stalled";
}
