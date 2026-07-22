import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDb, updateDb, uid, nowIso, today } from "@/lib/storage";
import { formatRelativeDays } from "@/lib/utils";
import { Card, Button, Input, EmptyState } from "@/components/ui/primitives";

export default function Tasks() {
  const db = useDb();
  const [showCompleted, setShowCompleted] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const relationshipById = new Map(db.relationships.map((r) => [r.id, r] as const));
  const contactById = new Map(db.contacts.map((c) => [c.id, c] as const));

  const sorted = useMemo(() => {
    return [...db.tasks]
      .filter((t) => showCompleted || !t.completed)
      .sort((a, b) => (a.dueAt ?? "9999").localeCompare(b.dueAt ?? "9999"));
  }, [db.tasks, showCompleted]);

  function toggle(id: string) {
    updateDb((d) => {
      const wasCompleted = d.tasks.find((t) => t.id === id)?.completed;
      const nextDaily = d.dailyProgress.some((p) => p.date === today())
        ? d.dailyProgress.map((p) =>
            p.date === today() ? { ...p, tasksCompleted: p.tasksCompleted + (wasCompleted ? -1 : 1) } : p,
          )
        : [...d.dailyProgress, { date: today(), touchesLogged: 0, tasksCompleted: 1, streakDays: 1, goalTouches: d.settings.dailyTouchGoal }];
      return {
        ...d,
        tasks: d.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed, completedAt: !t.completed ? nowIso() : undefined } : t)),
        dailyProgress: nextDaily,
      };
    });
  }

  function addTask() {
    if (!newTitle.trim()) return;
    updateDb((d) => ({
      ...d,
      tasks: [...d.tasks, { id: uid("task"), title: newTitle.trim(), completed: false, createdAt: nowIso() }],
    }));
    setNewTitle("");
  }

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
          <p className="text-sm text-ink/50">{sorted.filter((t) => !t.completed).length} open</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-ink/50">
          <input type="checkbox" checked={showCompleted} onChange={(e) => setShowCompleted(e.target.checked)} />
          Show completed
        </label>
      </div>

      <Card className="mb-6 flex gap-2 p-3">
        <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="New task…" onKeyDown={(e) => e.key === "Enter" && addTask()} />
        <Button onClick={addTask} disabled={!newTitle.trim()}>Add</Button>
      </Card>

      {sorted.length === 0 ? (
        <EmptyState title="Nothing here" description="Tasks tied to relationships and standalone to-dos both show up here." />
      ) : (
        <Card className="divide-y divide-black/5">
          {sorted.map((t) => {
            const relationship = t.relationshipId ? relationshipById.get(t.relationshipId) : undefined;
            const contact = relationship ? contactById.get(relationship.contactId) : undefined;
            const overdue = t.dueAt && !t.completed && new Date(t.dueAt) < new Date();
            return (
              <div key={t.id} className="flex items-center gap-3 p-4">
                <input type="checkbox" checked={t.completed} onChange={() => toggle(t.id)} />
                <div className="min-w-0 flex-1">
                  <div className={t.completed ? "text-ink/30 line-through" : ""}>{t.title}</div>
                  <div className="text-xs text-ink/40">
                    {contact && (
                      <Link to={`/relationships/${relationship!.id}`} className="hover:underline">
                        {contact.firstName} {contact.lastName}
                      </Link>
                    )}
                    {t.dueAt && (
                      <span className={overdue ? "ml-2 text-danger" : "ml-2"}>
                        {overdue ? "Overdue" : "Due"} {formatRelativeDays(t.dueAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
