import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { NoteCard } from "@/components/NoteCard";
import { useState } from "react";
import { Flame, Sparkles, Clock, TrendingUp } from "lucide-react";
import { usePublicNotes } from "@/hooks/useNotes";

export const Route = createFileRoute("/feed")({ component: Feed });

const tabs = [
  { id: "for-you", label: "For You", icon: Sparkles },
  { id: "trending", label: "Trending", icon: TrendingUp },
  { id: "hot", label: "Hot", icon: Flame },
  { id: "recent", label: "Recent", icon: Clock },
];

const DEPARTMENT_FILTERS = [
  "All",
  "CS",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "EE",
  "DBMS",
];

function Feed() {
  const [tab, setTab] = useState("for-you");
  const [filter, setFilter] = useState("All");

  const { data: allNotes = [], isLoading } = usePublicNotes({
    department: filter === "All" ? undefined : filter,
  });

  let filteredNotes = allNotes;

  // Apply tab-based sorting locally since backend doesn't support it yet
  filteredNotes = [...filteredNotes].sort((a, b) => {
    if (tab === "recent") {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    }
    if (tab === "trending") {
      return (b.downloads || 0) - (a.downloads || 0);
    }
    if (tab === "hot") {
      return (b.likes || 0) - (a.likes || 0);
    }
    return 0; // "for-you" default order
  });

  return (
    <AppShell>
      <div className="p-6 md:p-10 max-w-7xl mx-auto animate-fade-up">
        <PageHeader
          eyebrow="Home Feed"
          title="Discover notes tailored to you"
          description="Curated by your subjects, communities, and the people you follow."
        />

        <div className="glass rounded-2xl p-1.5 inline-flex gap-1 mb-4">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`h-9 px-4 rounded-xl text-sm inline-flex items-center gap-2 transition ${
                tab === t.id
                  ? "bg-white/10 text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-2 px-2">
          {DEPARTMENT_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 h-8 px-3 rounded-full text-xs font-medium transition border ${
                filter === f
                  ? "bg-white/10 border-white/20 text-foreground"
                  : "border-white/5 text-muted-foreground hover:bg-white/5"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {isLoading && (
            <div className="col-span-full text-center py-10 text-muted-foreground text-sm">
              Loading notes…
            </div>
          )}

          {!isLoading && filteredNotes.length === 0 && (
            <div className="col-span-full text-center py-10 text-muted-foreground text-sm">
              No notes available.
            </div>
          )}

          {!isLoading && filteredNotes.map((note) => <NoteCard key={note.noteId} note={note} />)}
        </div>

        {filteredNotes.length > 20 && (
          <div className="mt-10 flex justify-center">
            <button className="h-10 px-6 rounded-xl glass hover:bg-white/10 text-sm">
              Load More
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
