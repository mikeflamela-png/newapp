import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDb } from "@/lib/storage";
import { buildRelationshipViews, withLiveComputedFields } from "@/lib/selectors";
import { fullName } from "@/lib/utils";
import { Card, Badge, Select, Input } from "@/components/ui/primitives";
import { RELATIONSHIP_STAGES, MOMENTUM_STATUSES } from "@/types";

const momentumTone: Record<string, "success" | "accent" | "warning" | "danger" | "neutral"> = {
  Accelerating: "success",
  Steady: "accent",
  Cooling: "warning",
  Stalled: "neutral",
  "At Risk": "danger",
};

type SortKey = "score" | "priorityScore" | "lastContactedAt";

export default function Leaderboard() {
  const db = useDb();
  const [stageFilter, setStageFilter] = useState<string>("All");
  const [momentumFilter, setMomentumFilter] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("score");

  const rows = useMemo(() => {
    const views = buildRelationshipViews(db).map((v) => ({
      ...v,
      relationship: withLiveComputedFields(v.relationship, db),
    }));

    return views
      .filter((v) => stageFilter === "All" || v.relationship.stage === stageFilter)
      .filter((v) => momentumFilter === "All" || v.relationship.momentum === momentumFilter)
      .filter((v) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return `${fullName(v.contact)} ${v.company.name}`.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        if (sortKey === "lastContactedAt") {
          return (b.relationship.lastContactedAt ?? "").localeCompare(a.relationship.lastContactedAt ?? "");
        }
        return b.relationship[sortKey] - a.relationship[sortKey];
      });
  }, [db, stageFilter, momentumFilter, search, sortKey]);

  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">Leaderboard</h1>
      <p className="mb-6 text-sm text-ink/50">{rows.length} relationships, ranked.</p>

      <div className="mb-5 flex flex-wrap gap-3">
        <Input placeholder="Search name or company…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <Select value={stageFilter} onChange={setStageFilter} options={["All", ...RELATIONSHIP_STAGES]} />
        <Select value={momentumFilter} onChange={setMomentumFilter} options={["All", ...MOMENTUM_STATUSES]} />
        <Select
          value={sortKey}
          onChange={(v) => setSortKey(v as SortKey)}
          options={["score", "priorityScore", "lastContactedAt"]}
        />
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/10 bg-black/[0.02] text-xs uppercase tracking-wide text-ink/40">
            <tr>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Stage</th>
              <th className="px-4 py-3">Momentum</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Priority</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.relationship.id} className="border-b border-black/5 last:border-0 hover:bg-black/[0.02]">
                <td className="px-4 py-3 text-ink/40">{i + 1}</td>
                <td className="px-4 py-3">
                  <Link to={`/relationships/${row.relationship.id}`} className="font-medium hover:underline">
                    {fullName(row.contact)}
                  </Link>
                  <div className="text-xs text-ink/40">{row.contact.title}</div>
                </td>
                <td className="px-4 py-3">{row.company.name}</td>
                <td className="px-4 py-3">
                  <Badge>{row.relationship.stage}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={momentumTone[row.relationship.momentum]}>{row.relationship.momentum}</Badge>
                </td>
                <td className="px-4 py-3 font-semibold">{row.relationship.score}</td>
                <td className="px-4 py-3 text-ink/60">{row.relationship.priorityScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <div className="p-10 text-center text-sm text-ink/50">No relationships match these filters.</div>}
      </Card>
    </div>
  );
}
