import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Trophy,
  Inbox,
  CheckSquare,
  Clapperboard,
  Settings,
  UserPlus,
  Search,
} from "lucide-react";
import { cx } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/inbox", label: "Inbox", icon: Inbox },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/productions", label: "Productions", icon: Clapperboard },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ onOpenPalette }: { onOpenPalette: () => void }) {
  return (
    <aside className="fixed left-0 top-0 z-20 flex h-screen w-60 flex-col border-r border-black/10 bg-white">
      <div className="px-5 py-5">
        <div className="text-sm font-semibold tracking-tight">Relationship Leaderboard</div>
        <div className="text-xs text-ink/50">Ebb &amp; Flow Media — internal</div>
      </div>

      <div className="px-3">
        <button
          onClick={onOpenPalette}
          className="flex w-full items-center gap-2 rounded-lg border border-black/10 px-3 py-2 text-sm text-ink/50 hover:bg-black/5"
        >
          <Search className="h-4 w-4" />
          Search
          <span className="ml-auto rounded border border-black/10 px-1.5 py-0.5 text-[10px]">⌘K</span>
        </button>
      </div>

      <nav className="mt-4 flex-1 space-y-0.5 px-3">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cx(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive ? "bg-ink text-white" : "text-ink/70 hover:bg-black/5",
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3">
        <NavLink
          to="/relationships/new"
          className="flex items-center justify-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent/90"
        >
          <UserPlus className="h-4 w-4" />
          Add Relationship
        </NavLink>
      </div>
    </aside>
  );
}
