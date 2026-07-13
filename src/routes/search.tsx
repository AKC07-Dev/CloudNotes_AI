import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { NoteCard } from "@/components/NoteCard";
import { Search as SearchIcon, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { usePublicNotes } from "@/hooks/useNotes";

export const Route = createFileRoute("/search")({ component: SearchPage });

function SearchPage() {
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");

  // Debounce search input to avoid firing on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(q), 400);
    return () => clearTimeout(timer);
  }, [q]);

  const { data: notes = [], isLoading } = usePublicNotes(
    debouncedQ ? { search: debouncedQ } : undefined,
  );

  return (
    <AppShell>
      <div className="p-6 md:p-10 max-w-7xl mx-auto animate-fade-up">
        <PageHeader
          eyebrow="Search"
          title="Find anything, instantly"
          description="Search across notes, people, and communities."
        />

        <div className="glass-strong rounded-2xl p-2 flex items-center gap-2 shadow-premium">
          <SearchIcon className="h-4 w-4 text-muted-foreground ml-3" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder='Try: "dynamic programming", "fourier", "linear algebra"'
            className="flex-1 bg-transparent outline-none py-3 text-sm"
          />
          <button className="h-10 px-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm inline-flex items-center gap-2 hover:shadow-glow">
            <Sparkles className="h-4 w-4" /> Ask AI
          </button>
        </div>

        <div className="mt-6 flex gap-2 flex-wrap text-xs text-muted-foreground">
          {["Recent", "Verified only", "This semester", "Most downloaded", "With preview"].map(
            (f) => (
              <button
                key={f}
                className="h-8 px-3 rounded-full border border-white/5 hover:bg-white/5"
              >
                {f}
              </button>
            ),
          )}
        </div>

        <section className="mt-8">
          <h2 className="text-lg font-semibold mb-4">
            Notes{" "}
            <span className="text-muted-foreground text-sm">
              · {isLoading ? "…" : notes.length}
            </span>
          </h2>
          {isLoading ? (
            <div className="text-center py-10 text-muted-foreground text-sm">Searching…</div>
          ) : notes.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              {debouncedQ ? `No results for "${debouncedQ}"` : "Start typing to search notes."}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {notes.slice(0, 8).map((n) => (
                <NoteCard key={n.noteId} note={n} />
              ))}
            </div>
          )}
        </section>

        {/* People and Communities sections — backend endpoints not yet available */}
        <section className="mt-10 grid lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">People</h2>
            <div className="glass rounded-2xl p-8 text-center text-muted-foreground text-sm">
              People search coming soon.
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-4">Communities</h2>
            <div className="glass rounded-2xl p-8 text-center text-muted-foreground text-sm">
              Community search coming soon.
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
