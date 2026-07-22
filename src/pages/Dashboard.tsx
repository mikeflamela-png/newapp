import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useDb, updateDb, today } from "@/lib/storage";
import { liveRelationships, liveRecommendations } from "@/lib/selectors";
import { fullName } from "@/lib/utils";
import { Card, Badge, Button } from "@/components/ui/primitives";
import { Flame, TrendingUp, AlertTriangle, ArrowRight } from "lucide-react";

const urgencyTone: Record<string, "danger" | "warning" | "accent" | "neutral"> = {
  Critical: "danger",
  High: "warning",
  Medium: "accent",
  Low: "neutral",
};

export default function Dashboard() {
  const db = useDb();
  const relationships = useMemo(() => liveRelationships(db), [db]);
  const recommendations = useMemo(() => liveRecommendations(db), [db]);
  const contactById = new Map(db.contacts.map((c) => [c.id, c] as const));
  const companyById = new Map(db.companies.map((c) => [c.id, c] as const));

  const progress = db.dailyProgress.find((p) => p.date === today()) ?? {
    date: today(),
    touchesLogged: 0,
    tasksCompleted: 0,
    streakDays: 0,
    goalTouches: db.settings.dailyTouchGoal,
  };

  const atRiskCount = relationships.filter((r) => r.momentum === "At Risk" || r.momentum === "Cooling").length;
  const accelerating = relationships.filter((r) => r.momentum === "Accelerating").length;
  const activeClients = relationships.filter((r) => r.stage === "Active Client").length;

  function logQuickTouch() {
    updateDb((d) => {
      const idx = d.dailyProgress.findIndex((p) => p.date === today());
      if (idx === -1) {
        return { ...d, dailyProgress: [...d.dailyProgress, { date: today(), touchesLogged: 1, tasksCompleted: 0, streakDays: 1, goalTouches: d.settings.dailyTouchGoal }] };
      }
      const updated = [...d.dailyProgress];
      updated[idx] = { ...updated[idx], touchesLogged: updated[idx].touchesLogged + 1 };
      return { ...d, dailyProgress: updated };
    });
  }

  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Daily Brief</h1>
          <p className="text-sm text-ink/50">
            {db.settings.gamificationEnabled ? `${progress.streakDays}-day streak · ` : ""}
            {progress.touchesLogged}/{progress.goalTouches} touches logged today
          </p>
        </div>
        <Button onClick={logQuickTouch} variant="secondary">
          <Flame className="h-4 w-4" /> Log a quick touch
        </Button>
      </div>

      {db.settings.gamificationEnabled && (
        <div className="mb-8 h-2 w-full overflow-hidden rounded-full bg-black/5">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${Math.min(100, (progress.touchesLogged / Math.max(1, progress.goalTouches)) * 100)}%` }}
          />
        </div>
      )}

      <div className="mb-10 grid grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm text-ink/50">
            <TrendingUp className="h-4 w-4 text-success" /> Accelerating
          </div>
          <div className="mt-2 text-3xl font-semibold">{accelerating}</div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm text-ink/50">
            <AlertTriangle className="h-4 w-4 text-danger" /> Cooling / At Risk
          </div>
          <div className="mt-2 text-3xl font-semibold">{atRiskCount}</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-ink/50">Active Clients</div>
          <div className="mt-2 text-3xl font-semibold">{activeClients}</div>
        </Card>
      </div>

      <h2 className="mb-4 text-lg font-semibold">Top recommended actions</h2>
      <div className="space-y-3">
        {recommendations.slice(0, 6).map((rec) => {
          const relationship = relationships.find((r) => r.id === rec.relationshipId);
          const contact = relationship ? contactById.get(relationship.contactId) : undefined;
          const company = relationship ? companyById.get(relationship.companyId) : undefined;
          return (
            <Card key={rec.id} className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Badge tone={urgencyTone[rec.urgency]}>{rec.urgency}</Badge>
                  <span className="truncate font-medium">{rec.title}</span>
                </div>
                <p className="mt-1 text-sm text-ink/50">
                  {contact && company ? `${fullName(contact)} — ${company.name}` : ""}
                </p>
                <p className="mt-1 text-sm text-ink/60">{rec.rationale}</p>
              </div>
              {relationship && (
                <Link to={`/relationships/${relationship.id}`}>
                  <Button variant="secondary" className="whitespace-nowrap">
                    {rec.actionLabel} <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              )}
            </Card>
          );
        })}
        {recommendations.length === 0 && (
          <Card className="p-8 text-center text-sm text-ink/50">
            No recommendations right now — everything is on track.
          </Card>
        )}
      </div>
    </div>
  );
}
