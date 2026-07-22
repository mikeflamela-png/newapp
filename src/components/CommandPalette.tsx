import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDb } from "@/lib/storage";
import { fullName } from "@/lib/utils";
import { Modal, Input } from "@/components/ui/primitives";

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const db = useDb();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const contactById = new Map(db.contacts.map((c) => [c.id, c] as const));
    const companyById = new Map(db.companies.map((c) => [c.id, c] as const));

    return db.relationships
      .map((rel) => {
        const contact = contactById.get(rel.contactId);
        const company = companyById.get(rel.companyId);
        if (!contact || !company) return null;
        const haystack = `${fullName(contact)} ${company.name} ${rel.tags.join(" ")}`.toLowerCase();
        return haystack.includes(q) ? { rel, contact, company } : null;
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .slice(0, 8);
  }, [query, db]);

  return (
    <Modal open={open} onClose={onClose} title="Search" wide>
      <Input
        autoFocus
        placeholder="Search by name, company, or tag…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="mt-3 max-h-80 space-y-1 overflow-y-auto scrollbar-thin">
        {results.map(({ rel, contact, company }) => (
          <button
            key={rel.id}
            onClick={() => {
              navigate(`/relationships/${rel.id}`);
              onClose();
              setQuery("");
            }}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-black/5"
          >
            <span>
              {fullName(contact)} <span className="text-ink/40">— {company.name}</span>
            </span>
            <span className="text-xs text-ink/40">{rel.stage}</span>
          </button>
        ))}
        {query && results.length === 0 && (
          <div className="px-3 py-6 text-center text-sm text-ink/40">No matches.</div>
        )}
      </div>
    </Modal>
  );
}
