import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { CommandPalette } from "@/components/CommandPalette";
import Dashboard from "@/pages/Dashboard";
import Leaderboard from "@/pages/Leaderboard";
import RelationshipDetail from "@/pages/RelationshipDetail";
import AddRelationship from "@/pages/AddRelationship";
import AIInterview from "@/pages/AIInterview";
import Inbox from "@/pages/Inbox";
import Tasks from "@/pages/Tasks";
import Productions from "@/pages/Productions";
import SettingsPage from "@/pages/Settings";

export default function App() {
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-paper">
        <Sidebar onOpenPalette={() => setPaletteOpen(true)} />
        <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
        <main className="ml-60 min-h-screen">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/relationships/new" element={<AddRelationship />} />
            <Route path="/relationships/:id" element={<RelationshipDetail />} />
            <Route path="/relationships/:id/interview" element={<AIInterview />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/productions" element={<Productions />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
