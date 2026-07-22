import { useRef, useState } from "react";
import { useDb, updateDb, resetDemoData, exportDb, importDb } from "@/lib/storage";
import { Card, Input, Button, Badge } from "@/components/ui/primitives";

export default function SettingsPage() {
  const db = useDb();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [confirmingReset, setConfirmingReset] = useState(false);

  function updateSettings(patch: Partial<typeof db.settings>) {
    updateDb((d) => ({ ...d, settings: { ...d.settings, ...patch } }));
  }

  function handleExport() {
    const blob = new Blob([exportDb()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relationship-leaderboard-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const result = importDb(String(reader.result));
      setImportMessage(result.ok ? "Import successful." : `Import failed: ${result.error}`);
    };
    reader.readAsText(file);
  }

  return (
    <div className="mx-auto max-w-2xl px-8 py-10">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Settings</h1>

      <div className="space-y-6">
        {/* 1. Profile */}
        <Card className="p-5">
          <h2 className="mb-3 font-semibold">Profile</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-ink/50">Display name</label>
              <Input value={db.settings.displayName} onChange={(e) => updateSettings({ displayName: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-ink/50">Email</label>
              <Input value={db.settings.email} onChange={(e) => updateSettings({ email: e.target.value })} />
            </div>
          </div>
        </Card>

        {/* 2. Appearance */}
        <Card className="p-5">
          <h2 className="mb-3 font-semibold">Appearance</h2>
          <div className="flex gap-2">
            {(["light", "dark", "system"] as const).map((t) => (
              <Button key={t} variant={db.settings.theme === t ? "primary" : "secondary"} onClick={() => updateSettings({ theme: t })}>
                {t[0].toUpperCase() + t.slice(1)}
              </Button>
            ))}
          </div>
        </Card>

        {/* 3. Daily goal & gamification */}
        <Card className="p-5">
          <h2 className="mb-3 font-semibold">Daily goal &amp; gamification</h2>
          <div className="flex items-center gap-3">
            <label className="text-xs text-ink/50">Daily touch goal</label>
            <Input
              type="number"
              className="w-20"
              value={db.settings.dailyTouchGoal}
              onChange={(e) => updateSettings({ dailyTouchGoal: Number(e.target.value) || 1 })}
            />
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={db.settings.gamificationEnabled}
              onChange={(e) => updateSettings({ gamificationEnabled: e.target.checked })}
            />
            Show streaks and progress bar
          </label>
        </Card>

        {/* 4. Integrations */}
        <Card className="p-5">
          <h2 className="mb-3 font-semibold">Integrations</h2>
          <div className="flex items-center justify-between text-sm">
            <span>AI Service</span>
            <Badge tone="accent">{db.settings.aiProvider === "mock" ? "Simulated AI (default)" : "OpenAI"}</Badge>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span>Instantly</span>
            <Badge tone="accent">{db.settings.instantlyProvider === "mock" ? "Mock Instantly (default)" : "Instantly"}</Badge>
          </div>
          <p className="mt-3 text-xs text-ink/40">
            Live providers require server-side credentials and are not wired up in this deployment — see .env.example and
            src/lib/ai-service.ts / src/lib/instantly-service.ts for exactly what's needed to enable them.
          </p>
        </Card>

        {/* 5. Notifications */}
        <Card className="p-5">
          <h2 className="mb-3 font-semibold">Notifications</h2>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={db.settings.notificationsEnabled}
              onChange={(e) => updateSettings({ notificationsEnabled: e.target.checked })}
            />
            Enable in-app notifications
          </label>
        </Card>

        {/* 6. Data management */}
        <Card className="p-5">
          <h2 className="mb-3 font-semibold">Data</h2>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={handleExport}>Export JSON</Button>
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>Import JSON</Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleImportFile(e.target.files[0])}
            />
            {!confirmingReset ? (
              <Button variant="danger" onClick={() => setConfirmingReset(true)}>Reset demo data</Button>
            ) : (
              <>
                <Button variant="danger" onClick={() => { resetDemoData(); setConfirmingReset(false); }}>Confirm reset</Button>
                <Button variant="ghost" onClick={() => setConfirmingReset(false)}>Cancel</Button>
              </>
            )}
          </div>
          {importMessage && <p className="mt-2 text-xs text-ink/50">{importMessage}</p>}
        </Card>
      </div>
    </div>
  );
}
