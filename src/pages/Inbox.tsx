import { useState } from "react";
import { Link } from "react-router-dom";
import { useDb, updateDb } from "@/lib/storage";
import { fullName } from "@/lib/utils";
import { Card, Badge, EmptyState } from "@/components/ui/primitives";

export default function Inbox() {
  const db = useDb();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const messages = [...db.messages].sort((a, b) => b.sentAt.localeCompare(a.sentAt));
  const contactById = new Map(db.contacts.map((c) => [c.id, c] as const));
  const relationshipById = new Map(db.relationships.map((r) => [r.id, r] as const));

  function markRead(id: string) {
    updateDb((d) => ({ ...d, messages: d.messages.map((m) => (m.id === id ? { ...m, read: true } : m)) }));
    setSelectedId(id);
  }

  const selected = messages.find((m) => m.id === selectedId) ?? messages[0];

  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">Inbox</h1>
      <p className="mb-6 text-sm text-ink/50">
        Messages synced from relationship activity — outbound sends and inbound replies across email and LinkedIn.
      </p>

      {messages.length === 0 ? (
        <EmptyState title="No messages yet" description="Messages will appear here as relationships are contacted." />
      ) : (
        <div className="grid grid-cols-3 gap-6">
          <Card className="col-span-1 divide-y divide-black/5">
            {messages.map((m) => {
              const relationship = relationshipById.get(m.relationshipId);
              const contact = relationship ? contactById.get(relationship.contactId) : undefined;
              return (
                <button
                  key={m.id}
                  onClick={() => markRead(m.id)}
                  className={`block w-full p-4 text-left text-sm hover:bg-black/[0.02] ${selected?.id === m.id ? "bg-black/[0.03]" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={m.read ? "text-ink/60" : "font-semibold"}>{contact ? fullName(contact) : "Unknown"}</span>
                    {!m.read && <span className="h-2 w-2 rounded-full bg-accent" />}
                  </div>
                  <div className="truncate text-xs text-ink/40">{m.subject}</div>
                </button>
              );
            })}
          </Card>

          <Card className="col-span-2 p-6">
            {selected && (
              <>
                <div className="mb-3 flex items-center gap-2">
                  <Badge tone={selected.direction === "Inbound" ? "success" : "accent"}>{selected.direction}</Badge>
                  <Badge>{selected.channel}</Badge>
                </div>
                <h2 className="mb-2 text-lg font-semibold">{selected.subject}</h2>
                <p className="text-sm text-ink/70">{selected.fullBody ?? selected.preview}</p>
                {relationshipById.get(selected.relationshipId) && (
                  <Link
                    to={`/relationships/${selected.relationshipId}`}
                    className="mt-4 inline-block text-sm text-accent hover:underline"
                  >
                    View relationship →
                  </Link>
                )}
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
