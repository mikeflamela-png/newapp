import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useDb, updateDb, uid, nowIso } from "@/lib/storage";
import { findRelationshipView } from "@/lib/selectors";
import { getAIService } from "@/lib/ai-service";
import { fullName } from "@/lib/utils";
import { Card, Textarea, Button, Badge, Select } from "@/components/ui/primitives";
import type { RelationshipMemory } from "@/types";

const CATEGORIES: RelationshipMemory["category"][] = [
  "Personal",
  "Professional Context",
  "Preferences",
  "Sensitivities",
  "History",
  "Goals",
];

const PROMPTS = [
  "What do you know about them personally — family, hobbies, things they've mentioned outside of work?",
  "What's their role in the decision-making process at their company?",
  "How do they prefer to communicate — quick calls, detailed emails, in person?",
  "Is there anything sensitive to be careful about — past bad experiences, pet peeves, timing constraints?",
  "What's the history of this relationship — how did it start, what's happened so far?",
  "What are they trying to accomplish right now, professionally?",
];

export default function AIInterview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const db = useDb();
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [pendingInsights, setPendingInsights] = useState<string[]>([]);
  const [category, setCategory] = useState<RelationshipMemory["category"]>("Personal");

  const view = id ? findRelationshipView(db, id) : null;
  const ai = getAIService();

  if (!view) {
    return (
      <div className="mx-auto max-w-xl px-8 py-16 text-center text-ink/50">
        Relationship not found. <Link to="/leaderboard" className="text-accent hover:underline">Back to leaderboard</Link>
      </div>
    );
  }

  async function extract() {
    if (!answer.trim()) return;
    setExtracting(true);
    const insights = await ai.extractContextFromNotes(answer.trim());
    setPendingInsights(insights);
    setExtracting(false);
  }

  function saveInsight(text: string) {
    if (!view) return;
    updateDb((d) => ({
      ...d,
      memories: [
        ...d.memories,
        {
          id: uid("mem"),
          relationshipId: view.relationship.id,
          category,
          note: text.replace(/^Simulated AI insight:\s*/, ""),
          source: "AI Interview",
          createdAt: nowIso(),
        },
      ],
    }));
    setPendingInsights((prev) => prev.filter((p) => p !== text));
  }

  function nextStep() {
    setAnswer("");
    setPendingInsights([]);
    setStep((s) => Math.min(s + 1, PROMPTS.length - 1));
  }

  return (
    <div className="mx-auto max-w-2xl px-8 py-10">
      <div className="mb-1 flex items-center gap-2">
        <Badge tone="accent">{ai.label}</Badge>
        <span className="text-xs text-ink/40">Context Interview</span>
      </div>
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">{fullName(view.contact)}</h1>
      <p className="mb-6 text-sm text-ink/50">
        Question {step + 1} of {PROMPTS.length}. Answers become permanent human-context memory — nothing here is guessed by an AI, it only helps structure what you already know.
      </p>

      <Card className="space-y-4 p-6">
        <p className="font-medium">{PROMPTS[step]}</p>
        <Textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={4} placeholder="Type freely — full sentences work best." />
        <div className="flex justify-end">
          <Button onClick={extract} disabled={!answer.trim() || extracting}>
            {extracting ? "Extracting…" : "Extract context"}
          </Button>
        </div>

        {pendingInsights.length > 0 && (
          <div className="space-y-2 border-t border-black/10 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-ink/50">Save as:</span>
              <Select value={category} onChange={(v) => setCategory(v as RelationshipMemory["category"])} options={CATEGORIES} />
            </div>
            {pendingInsights.map((insight) => (
              <div key={insight} className="flex items-center justify-between gap-3 rounded-lg bg-black/[0.02] p-3 text-sm">
                <span>{insight}</span>
                <Button variant="secondary" onClick={() => saveInsight(insight)}>Save</Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="mt-6 flex justify-between">
        <Button variant="ghost" onClick={() => navigate(`/relationships/${view.relationship.id}`)}>
          Exit interview
        </Button>
        {step < PROMPTS.length - 1 ? (
          <Button variant="secondary" onClick={nextStep}>Next question</Button>
        ) : (
          <Button onClick={() => navigate(`/relationships/${view.relationship.id}`)}>Finish</Button>
        )}
      </div>
    </div>
  );
}
