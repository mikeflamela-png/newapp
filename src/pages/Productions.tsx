import { useState } from "react";
import { Link } from "react-router-dom";
import { useDb } from "@/lib/storage";
import { fullName } from "@/lib/utils";
import { Card, Badge, Select } from "@/components/ui/primitives";
import type { Production } from "@/types";

const STATUSES: Production["status"][] = ["In Development", "Casting", "In Production", "Post", "Released"];

const statusTone: Record<Production["status"], "neutral" | "accent" | "warning" | "success"> = {
  "In Development": "neutral",
  Casting: "warning",
  "In Production": "accent",
  Post: "accent",
  Released: "success",
};

export default function Productions() {
  const db = useDb();
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const filtered = db.productions.filter((p) => statusFilter === "All" || p.status === statusFilter);
  const contactById = new Map(db.contacts.map((c) => [c.id, c] as const));
  const relationshipById = new Map(db.relationships.map((r) => [r.id, r] as const));

  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Productions</h1>
          <p className="text-sm text-ink/50">{filtered.length} of {db.productions.length}</p>
        </div>
        <Select value={statusFilter} onChange={setStatusFilter} options={["All", ...STATUSES]} />
      </div>

      <div className="grid grid-cols-2 gap-5">
        {filtered.map((p) => {
          const matches = db.productionMatches.filter((m) => m.productionId === p.id);
          return (
            <Card key={p.id} className="p-5">
              <div className="mb-2 flex items-start justify-between">
                <h2 className="font-semibold">{p.name}</h2>
                <Badge tone={statusTone[p.status]}>{p.status}</Badge>
              </div>
              <div className="text-xs uppercase tracking-wide text-ink/40">{p.type}</div>
              {p.loglines && <p className="mt-2 text-sm text-ink/60">{p.loglines}</p>}
              {matches.length > 0 && (
                <div className="mt-4 space-y-1 border-t border-black/5 pt-3">
                  <div className="text-xs text-ink/40">Matched relationships</div>
                  {matches.map((m) => {
                    const relationship = relationshipById.get(m.relationshipId);
                    const contact = relationship ? contactById.get(relationship.contactId) : undefined;
                    if (!contact || !relationship) return null;
                    return (
                      <Link
                        key={m.id}
                        to={`/relationships/${relationship.id}`}
                        className="flex items-center justify-between text-sm hover:underline"
                      >
                        <span>{fullName(contact)}</span>
                        <span className="text-ink/40">{m.fitScore} fit</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
