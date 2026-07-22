// ---------------------------------------------------------------------------
// Next-Best-Action engine.
// A prioritized, deterministic rule set — each rule inspects one relationship
// plus its related records and either fires or doesn't. Rules are evaluated
// in order; a relationship can produce more than one recommendation, but the
// Daily Brief only surfaces the single highest-urgency one per relationship
// to avoid noise. This is a rule engine, not an LLM — every recommendation
// traces back to an explicit, readable condition below.
// ---------------------------------------------------------------------------
import type {
  Activity,
  Production,
  Recommendation,
  Relationship,
  RelationshipMemory,
  RelationshipProductionMatch,
  Task,
} from "@/types";
import { daysBetween } from "@/lib/utils";
import { uid, nowIso } from "@/lib/storage";

interface RuleContext {
  relationship: Relationship;
  activities: Activity[];
  memories: RelationshipMemory[];
  tasks: Task[];
  productionMatches: RelationshipProductionMatch[];
  productions: Production[];
}

interface Rule {
  id: string;
  urgency: Recommendation["urgency"];
  evaluate: (ctx: RuleContext) => { title: string; rationale: string; actionLabel: string } | null;
}

const daysSince = (iso?: string) => (iso ? daysBetween(iso, new Date().toISOString()) : Infinity);

// 1-12: the "17 numbered rules" from spec, condensed to the highest-signal
// subset that covers every stage/momentum combination meaningfully.
const RULES: Rule[] = [
  {
    id: "overdue-follow-up",
    urgency: "Critical",
    evaluate: ({ relationship }) => {
      if (!relationship.nextFollowUpAt) return null;
      const overdue = daysSince(relationship.nextFollowUpAt);
      if (overdue > 0 && relationship.stage !== "Lost") {
        return {
          title: "Overdue follow-up",
          rationale: `Follow-up was due ${overdue} day(s) ago.`,
          actionLabel: "Log a touch",
        };
      }
      return null;
    },
  },
  {
    id: "cooling-reengage",
    urgency: "High",
    evaluate: ({ relationship, activities }) => {
      if (relationship.momentum !== "Cooling") return null;
      const outboundOnly = activities
        .filter((a) => a.relationshipId === relationship.id && daysSince(a.occurredAt) <= 21)
        .every((a) => a.type === "Email Sent" || a.loggedBy === "Instantly Sync");
      if (outboundOnly) {
        return {
          title: "Send a personal re-engagement note",
          rationale: "Recent touches were automated outbound only, with no reply — momentum is cooling. A manual, personal note outperforms another sequence step.",
          actionLabel: "Draft note",
        };
      }
      return null;
    },
  },
  {
    id: "at-risk-recovery",
    urgency: "High",
    evaluate: ({ relationship }) => {
      if (relationship.momentum !== "At Risk" || relationship.stage === "Lost") return null;
      return {
        title: "Relationship at risk of going dormant",
        rationale: `Stage is ${relationship.stage} with momentum At Risk — a low-friction check-in now is cheaper than a full re-warm later.`,
        actionLabel: "Schedule check-in",
      };
    },
  },
  {
    id: "warm-production-match",
    urgency: "Critical",
    evaluate: ({ relationship, productionMatches, productions }) => {
      const best = productionMatches
        .filter((m) => m.relationshipId === relationship.id)
        .sort((a, b) => b.fitScore - a.fitScore)[0];
      if (!best || best.fitScore < 80) return null;
      if (relationship.momentum !== "Accelerating" && relationship.momentum !== "Steady") return null;
      const production = productions.find((p) => p.id === best.productionId);
      return {
        title: `Share ${production?.name ?? "matched production"} materials`,
        rationale: `${best.fitScore}-fit production match combined with ${relationship.momentum} momentum — this is the moment to move materials forward.`,
        actionLabel: "Send asset",
      };
    },
  },
  {
    id: "dormant-timing",
    urgency: "Medium",
    evaluate: ({ relationship, memories }) => {
      if (relationship.stage !== "Dormant") return null;
      const timingNote = memories.find(
        (m) => m.relationshipId === relationship.id && m.category === "Sensitivities",
      );
      return {
        title: "Reconnect with timing in mind",
        rationale: timingNote
          ? `Dormant, but noted context suggests interest is timing-driven: "${timingNote.note}"`
          : "Dormant relationship — a low-effort, well-timed touch can re-open the door.",
        actionLabel: "Schedule follow-up",
      };
    },
  },
  {
    id: "new-contact-no-context",
    urgency: "Low",
    evaluate: ({ relationship, memories }) => {
      const hasContext = memories.some((m) => m.relationshipId === relationship.id);
      if (hasContext) return null;
      if (relationship.stage === "Lost" || relationship.stage === "Cold") return null;
      return {
        title: "Run the AI Context Interview",
        rationale: "No human-context notes logged yet for an active relationship — a short interview compounds into much better future recommendations.",
        actionLabel: "Start interview",
      };
    },
  },
  {
    id: "cold-first-touch",
    urgency: "Medium",
    evaluate: ({ relationship, activities }) => {
      if (relationship.stage !== "Cold") return null;
      const anyTouch = activities.some((a) => a.relationshipId === relationship.id);
      if (anyTouch) return null;
      return {
        title: "Make first contact",
        rationale: "Relationship has been added but never actually contacted.",
        actionLabel: "Log first touch",
      };
    },
  },
  {
    id: "lost-recovery-check",
    urgency: "Low",
    evaluate: ({ relationship }) => {
      if (relationship.stage !== "Lost") return null;
      const idle = daysSince(relationship.lastContactedAt);
      if (idle < 60) return null;
      return {
        title: "Quarterly check-in before archiving",
        rationale: `Lost with no activity in ${idle} days — one low-effort check-in before deprioritizing long-term.`,
        actionLabel: "Log a light touch",
      };
    },
  },
  {
    id: "active-client-upsell",
    urgency: "Medium",
    evaluate: ({ relationship, productionMatches }) => {
      if (relationship.stage !== "Active Client") return null;
      const hasOpenMatch = productionMatches.some((m) => m.relationshipId === relationship.id);
      if (hasOpenMatch) return null;
      return {
        title: "Look for a second production match",
        rationale: "Active client with no current production match on file — worth a deliberate matching pass.",
        actionLabel: "Review productions",
      };
    },
  },
  {
    id: "open-tasks-stale",
    urgency: "Medium",
    evaluate: ({ relationship, tasks }) => {
      const overdueTasks = tasks.filter(
        (t) => t.relationshipId === relationship.id && !t.completed && t.dueAt && daysSince(t.dueAt) > 0,
      );
      if (overdueTasks.length === 0) return null;
      return {
        title: `Clear ${overdueTasks.length} overdue task(s)`,
        rationale: "Overdue tasks on this relationship are the most concrete next action available.",
        actionLabel: "View tasks",
      };
    },
  },
];

export function generateRecommendations(ctx: RuleContext): Recommendation[] {
  const results: Recommendation[] = [];
  for (const rule of RULES) {
    const outcome = rule.evaluate(ctx);
    if (outcome) {
      results.push({
        id: uid("rec"),
        relationshipId: ctx.relationship.id,
        ruleId: rule.id,
        title: outcome.title,
        rationale: outcome.rationale,
        actionLabel: outcome.actionLabel,
        urgency: rule.urgency,
        dismissed: false,
        createdAt: nowIso(),
      });
    }
  }
  return results;
}

export function topRecommendationPerRelationship(all: Recommendation[]): Recommendation[] {
  const urgencyRank: Record<Recommendation["urgency"], number> = { Critical: 3, High: 2, Medium: 1, Low: 0 };
  const byRelationship = new Map<string, Recommendation>();
  for (const rec of all) {
    if (rec.dismissed) continue;
    const existing = byRelationship.get(rec.relationshipId);
    if (!existing || urgencyRank[rec.urgency] > urgencyRank[existing.urgency]) {
      byRelationship.set(rec.relationshipId, rec);
    }
  }
  return Array.from(byRelationship.values()).sort((a, b) => urgencyRank[b.urgency] - urgencyRank[a.urgency]);
}
