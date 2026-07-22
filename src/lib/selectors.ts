// ---------------------------------------------------------------------------
// Cross-page selectors — derive live, computed values (score, momentum,
// priority, recommendations) from raw stored records. Keeping this in one
// place means every page sees numbers computed the same way.
// ---------------------------------------------------------------------------
import type { Database } from "@/lib/storage";
import type { Company, Contact, Relationship, RelationshipView } from "@/types";
import { computeScore, computePriorityScore, recomputeMomentum } from "@/lib/scoring";
import { generateRecommendations, topRecommendationPerRelationship } from "@/lib/recommendations";

export function buildRelationshipViews(db: Database): RelationshipView[] {
  const contactById = new Map(db.contacts.map((c) => [c.id, c] as const));
  const companyById = new Map(db.companies.map((c) => [c.id, c] as const));

  return db.relationships
    .map((relationship) => {
      const contact = contactById.get(relationship.contactId);
      const company = companyById.get(relationship.companyId);
      if (!contact || !company) return null;
      return { relationship, contact, company };
    })
    .filter((v): v is RelationshipView => v !== null);
}

export function withLiveComputedFields(
  relationship: Relationship,
  db: Pick<Database, "activities" | "memories">,
): Relationship {
  const momentum = recomputeMomentum(relationship, db.activities);
  const withMomentum = { ...relationship, momentum };
  const score = computeScore(withMomentum, db.activities, db.memories);
  const priorityScore = computePriorityScore(withMomentum, score);
  return { ...withMomentum, score, priorityScore };
}

export function liveRelationships(db: Database): Relationship[] {
  return db.relationships.map((r) => withLiveComputedFields(r, db));
}

export function liveRecommendations(db: Database) {
  const all = liveRelationships(db);
  const generated = all.flatMap((relationship) =>
    generateRecommendations({
      relationship,
      activities: db.activities,
      memories: db.memories,
      tasks: db.tasks,
      productionMatches: db.productionMatches,
      productions: db.productions,
    }),
  );
  return topRecommendationPerRelationship(generated);
}

export function findRelationshipView(
  db: Database,
  relationshipId: string,
): { relationship: Relationship; contact: Contact; company: Company } | null {
  const relationship = db.relationships.find((r) => r.id === relationshipId);
  if (!relationship) return null;
  const contact = db.contacts.find((c) => c.id === relationship.contactId);
  const company = db.companies.find((c) => c.id === relationship.companyId);
  if (!contact || !company) return null;
  return { relationship: withLiveComputedFields(relationship, db), contact, company };
}
