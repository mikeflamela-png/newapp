import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDb, updateDb, uid, nowIso } from "@/lib/storage";
import { findRelationshipView } from "@/lib/selectors";
import { computeScoreFactors } from "@/lib/scoring";
import { fullName, formatRelativeDays } from "@/lib/utils";
import { Card, Badge, Button, Textarea, Select } from "@/components/ui/primitives";
import { ACTIVITY_TYPES, RELATIONSHIP_STAGES, type ActivityType } from "@/types";
import { Sparkles, Mail, Phone, Linkedin } from "lucide-react";

const momentumTone: Record<string, "success" | "accent" | "warning" | "danger" | "neutral"> = {
  Accelerating: "success",
  Steady: "accent",
  Cooling: "warning",
  Stalled: "neutral",
  "At Risk": "danger",
};

export default function RelationshipDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const db = useDb();
  const [note, setNote] = useState("");
  const [activityType, setActivityType] = useState<ActivityType>("Note");

  const view = useMemo(() => (id ? findRelationshipView(db, id) : null), [db, id]);

  if (!view) {
    return (
      <div className="mx-auto max-w-3xl px-8 py-16 text-center">
        <p className="text-ink/50">Relationship not found.</p>
        <Link to="/leaderboard" className="mt-4 inline-block text-accent hover:underline">
          Back to leaderboard
        </Link>
      </div>
    );
  }

  const { relationship, contact, company } = view;
  const factors = computeScoreFactors(relationship, db.activities, db.memories);
  const memories = db.memories.filter((m) => m.relationshipId === relationship.id);
  const activities = db.activities
    .filter((a) => a.relationshipId === relationship.id)
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  const relatedTasks = db.tasks.filter((t) => t.relationshipId === relationship.id);
  const matches = db.productionMatches.filter((m) => m.relationshipId === relationship.id);
  const assets = db.assets.filter((a) => a.relationshipId === relationship.id);
  const intel = db.intelligence.find((i) => i.companyId === company.id);

  function logActivity() {
    if (!note.trim()) return;
    updateDb((d) => ({
      ...d,
      activities: [
        ...d.activities,
        {
          id: uid("act"),
          relationshipId: relationship.id,
          type: activityType,
          summary: note.trim(),
          loggedBy: "User",
          occurredAt: nowIso(),
        },
      ],
      relationships: d.relationships.map((r) => (r.id === relationship.id ? { ...r, lastContactedAt: nowIso(), updatedAt: nowIso() } : r)),
    }));
    setNote("");
  }

  function changeStage(stage: string) {
    updateDb((d) => ({
      ...d,
      relationships: d.relationships.map((r) => (r.id === relationship.id ? { ...r, stage: stage as typeof r.stage, updatedAt: nowIso() } : r)),
      activities: [
        ...d.activities,
        { id: uid("act"), relationshipId: relationship.id, type: "Stage Change", summary: `Stage changed to ${stage}`, loggedBy: "User", occurredAt: nowIso() },
      ],
    }));
  }

  function toggleTask(taskId: string) {
    updateDb((d) => ({
      ...d,
      tasks: d.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed, completedAt: !t.completed ? nowIso() : undefined } : t)),
    }));
  }

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      {/* A. Header / identity */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-ink/40">{company.name}</div>
          <h1 className="text-2xl font-semibold tracking-tight">{fullName(contact)}</h1>
          <p className="text-sm text-ink/50">{contact.title}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Select value={relationship.stage} onChange={changeStage} options={RELATIONSHIP_STAGES} />
            <Badge tone={momentumTone[relationship.momentum]}>{relationship.momentum}</Badge>
            {relationship.tags.map((t) => (
              <Badge key={t}>{t}</Badge>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 text-right">
          <div className="text-4xl font-semibold">{relationship.score}</div>
          <div className="text-xs text-ink/40">Priority {relationship.priorityScore}/40</div>
          <div className="flex gap-2">
            <a href={`mailto:${contact.email}`}><Button variant="secondary"><Mail className="h-4 w-4" /></Button></a>
            {contact.phone && <a href={`tel:${contact.phone}`}><Button variant="secondary"><Phone className="h-4 w-4" /></Button></a>}
            {contact.linkedinUrl && <a href={contact.linkedinUrl} target="_blank" rel="noreferrer"><Button variant="secondary"><Linkedin className="h-4 w-4" /></Button></a>}
          </div>
        </div>
      </div>

      <div className="mb-8">
        <Link to={`/relationships/${relationship.id}/interview`}>
          <Button>
            <Sparkles className="h-4 w-4" /> Run AI Context Interview
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {/* F. Activity timeline + logging */}
          <Card className="p-5">
            <h2 className="mb-3 font-semibold">Log an activity</h2>
            <div className="flex gap-2">
              <Select value={activityType} onChange={(v) => setActivityType(v as ActivityType)} options={ACTIVITY_TYPES} className="w-48" />
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="What happened?" className="flex-1" rows={2} />
            </div>
            <div className="mt-2 flex justify-end">
              <Button onClick={logActivity} disabled={!note.trim()}>Log activity</Button>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 font-semibold">Activity timeline</h2>
            <div className="space-y-3">
              {activities.map((a) => (
                <div key={a.id} className="border-l-2 border-black/10 pl-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Badge>{a.type}</Badge>
                    <span className="text-xs text-ink/40">{formatRelativeDays(a.occurredAt)}</span>
                  </div>
                  <p className="mt-1 text-sm">{a.summary}</p>
                </div>
              ))}
              {activities.length === 0 && <p className="text-sm text-ink/40">No activity logged yet.</p>}
            </div>
          </Card>

          {/* H. Production matches */}
          <Card className="p-5">
            <h2 className="mb-3 font-semibold">Production matches</h2>
            <div className="space-y-3">
              {matches.map((m) => {
                const production = db.productions.find((p) => p.id === m.productionId);
                return (
                  <div key={m.id} className="rounded-lg bg-black/[0.02] p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{production?.name}</span>
                      <Badge tone="accent">{m.fitScore} fit</Badge>
                    </div>
                    <p className="mt-1 text-sm text-ink/60">{m.rationale}</p>
                  </div>
                );
              })}
              {matches.length === 0 && <p className="text-sm text-ink/40">No production matches yet.</p>}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {/* B. Score breakdown */}
          <Card className="p-5">
            <h2 className="mb-3 font-semibold">Score breakdown</h2>
            <div className="space-y-2">
              {factors.map((f) => (
                <div key={f.key}>
                  <div className="flex justify-between text-xs">
                    <span>{f.label}</span>
                    <span className="text-ink/40">{f.points}/{f.maxPoints}</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-black/5">
                    <div className="h-full rounded-full bg-ink" style={{ width: `${(f.points / f.maxPoints) * 100}%` }} />
                  </div>
                  <div className="mt-0.5 text-[11px] text-ink/40">{f.explanation}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* D. Human context */}
          <Card className="p-5">
            <h2 className="mb-3 font-semibold">Human context</h2>
            <div className="space-y-2">
              {memories.map((m) => (
                <div key={m.id} className="rounded-lg bg-black/[0.02] p-2.5 text-sm">
                  <Badge>{m.category}</Badge>
                  <p className="mt-1 text-ink/70">{m.note}</p>
                </div>
              ))}
              {memories.length === 0 && <p className="text-sm text-ink/40">No context yet — run the AI Interview.</p>}
            </div>
          </Card>

          {/* E. Company intelligence */}
          {intel && (
            <Card className="p-5">
              <h2 className="mb-2 font-semibold">Company intelligence</h2>
              <Badge tone="accent">{intel.generatedBy}</Badge>
              <p className="mt-2 text-sm text-ink/70">{intel.summary}</p>
            </Card>
          )}

          {/* G. Tasks */}
          <Card className="p-5">
            <h2 className="mb-3 font-semibold">Tasks</h2>
            <div className="space-y-2">
              {relatedTasks.map((t) => (
                <label key={t.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={t.completed} onChange={() => toggleTask(t.id)} />
                  <span className={t.completed ? "text-ink/30 line-through" : ""}>{t.title}</span>
                </label>
              ))}
              {relatedTasks.length === 0 && <p className="text-sm text-ink/40">No tasks.</p>}
            </div>
          </Card>

          {/* I. Assets */}
          <Card className="p-5">
            <h2 className="mb-3 font-semibold">Assets</h2>
            <div className="space-y-1">
              {assets.map((a) => (
                <div key={a.id} className="flex items-center justify-between text-sm">
                  <span>{a.label}</span>
                  <Badge>{a.type}</Badge>
                </div>
              ))}
              {assets.length === 0 && <p className="text-sm text-ink/40">No assets attached.</p>}
            </div>
          </Card>
        </div>
      </div>

      <button onClick={() => navigate(-1)} className="mt-8 text-sm text-ink/40 hover:underline">
        ← Back
      </button>
    </div>
  );
}
