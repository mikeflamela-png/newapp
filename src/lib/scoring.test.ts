import { describe, expect, it } from "vitest";
import { computeScore, computePriorityScore, computeRecencyPoints, recomputeMomentum } from "@/lib/scoring";
import type { Activity, Relationship } from "@/types";

function makeRelationship(overrides: Partial<Relationship> = {}): Relationship {
  return {
    id: "rel_test",
    contactId: "ct_test",
    companyId: "co_test",
    source: "Manual Add",
    stage: "Engaged",
    momentum: "Steady",
    score: 0,
    priorityScore: 0,
    ownerName: "Tester",
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("computeRecencyPoints", () => {
  it("awards full points for very recent contact", () => {
    const iso = new Date().toISOString();
    expect(computeRecencyPoints(iso).points).toBe(20);
  });

  it("awards zero points when never contacted", () => {
    expect(computeRecencyPoints(undefined).points).toBe(0);
  });
});

describe("computeScore", () => {
  it("caps score at 100 regardless of inputs", () => {
    const relationship = makeRelationship({ stage: "Active Client", momentum: "Accelerating", lastContactedAt: new Date().toISOString() });
    const activities: Activity[] = Array.from({ length: 20 }, (_, i) => ({
      id: `act_${i}`,
      relationshipId: "rel_test",
      type: "Meeting",
      summary: "test",
      loggedBy: "User",
      occurredAt: new Date().toISOString(),
    }));
    const score = computeScore(relationship, activities, []);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("scores a cold, never-contacted relationship low", () => {
    const relationship = makeRelationship({ stage: "Cold", momentum: "Stalled" });
    const score = computeScore(relationship, [], []);
    expect(score).toBeLessThan(15);
  });
});

describe("computePriorityScore", () => {
  it("increases priority for overdue follow-ups", () => {
    const overdue = makeRelationship({ nextFollowUpAt: new Date(Date.now() - 5 * 86400000).toISOString() });
    const notOverdue = makeRelationship({ nextFollowUpAt: new Date(Date.now() + 5 * 86400000).toISOString() });
    expect(computePriorityScore(overdue, 50)).toBeGreaterThan(computePriorityScore(notOverdue, 50));
  });

  it("caps priority at 40", () => {
    const relationship = makeRelationship({
      nextFollowUpAt: new Date(Date.now() - 100 * 86400000).toISOString(),
      momentum: "At Risk",
      stage: "Active Client",
    });
    expect(computePriorityScore(relationship, 100)).toBeLessThanOrEqual(40);
  });
});

describe("recomputeMomentum", () => {
  it("marks long-idle relationships as At Risk", () => {
    const relationship = makeRelationship({ lastContactedAt: new Date(Date.now() - 60 * 86400000).toISOString() });
    expect(recomputeMomentum(relationship, [])).toBe("At Risk");
  });

  it("marks Lost relationships as At Risk regardless of activity", () => {
    const relationship = makeRelationship({ stage: "Lost", lastContactedAt: new Date().toISOString() });
    expect(recomputeMomentum(relationship, [])).toBe("At Risk");
  });
});
