
//WORKING FINE


import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Folder, Plus, Trash2 } from "lucide-react";
import { useBookmarks, useUpdateBookmark, useDeleteBookmark } from "@/hooks/useInteractions";
import { usePublicNotes } from "@/hooks/useNotes";
import { NoteCard } from "@/components/NoteCard";
import { useState } from "react";

export const Route = createFileRoute("/bookmarks")({ component: Bookmarks });

const DEFAULT_COLLECTIONS = [
  { name: "Exam Prep", color: "linear-gradient(135deg,#6366F1,#06B6D4)" },
  { name: "Interview", color: "linear-gradient(135deg,#F59E0B,#EF4444)" },
  { name: "Reading list", color: "linear-gradient(135deg,#10B981,#22D3EE)" },
  { name: "Personal", color: "linear-gradient(135deg,#EC4899,#8B5CF6)" },
];

function Bookmarks() {
  const { data: bookmarks = [], isLoading: bookmarksLoading } = useBookmarks();
  const { data: allNotes = [], isLoading: notesLoading } = usePublicNotes();
  const updateBookmark = useUpdateBookmark();
  const deleteBookmark = useDeleteBookmark();
  const [activeCollection, setActiveCollection] = useState<string | null>(null);

  const collections = DEFAULT_COLLECTIONS.map((c) => ({
    ...c,
    count: bookmarks.filter((b) => b.collection === c.name).length,
  }));

  // Create an "Uncategorized" collection count
  const uncategorizedCount = bookmarks.filter((b) => !b.collection).length;
  if (uncategorizedCount > 0) {
    collections.push({
      name: "Uncategorized",
      color: "linear-gradient(135deg,#4B5563,#9CA3AF)",
      count: uncategorizedCount,
    });
  }

  const isLoading = bookmarksLoading || notesLoading;

  const filteredBookmarks = activeCollection
    ? bookmarks.filter(
        (b) =>
          b.collection === activeCollection ||
          (activeCollection === "Uncategorized" && !b.collection),
      )
    : bookmarks;

  const displayNotes = filteredBookmarks
    .map((b) => {
      // Allow populated backend data or fallback to public notes mapping
      const noteData =
        (b as typeof b & { note?: (typeof allNotes)[0] }).note ||
        allNotes.find((n) => n.noteId === b.noteId);
      return noteData ? { ...noteData, _bookmarkId: b.noteId, _collection: b.collection } : null;
    })
    .filter(Boolean);

  return (
    <AppShell>
      <div className="p-6 md:p-10 max-w-7xl mx-auto animate-fade-up">
        <PageHeader
          eyebrow="Library"
          title="Bookmarks &amp; Collections"
          description="Everything you've saved, organized your way."
          // actions={
          //   <button className="inline-flex items-center gap-2 h-10 px-4 rounded-xl glass hover:bg-white/10 text-sm">
          //     <Plus className="h-4 w-4" /> New collection
          //   </button>
          // }
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div>
            <div className="h-10 w-10 rounded-xl grid place-items-center mb-3 bg-gradient-to-br from-primary to-secondary">
            <Folder className="h-5 w-5" />
            </div>
            <div className="font-semibold">Total Bookmarks</div>
            <div className="text-xs text-muted-foreground">{bookmarks.length} notes</div>
          </div>
          {/* {collections.map((c) => (
            <div
              key={c.name}
              onClick={() => setActiveCollection(c.name)}
              className={`glass rounded-2xl p-5 transition cursor-pointer ${
                activeCollection === c.name
                  ? "ring-2 ring-primary shadow-glow"
                  : "hover:shadow-premium"
              }`}
            >
              <div
                className="h-10 w-10 rounded-xl grid place-items-center mb-3"
                style={{ background: c.color }}
              >
                <Folder className="h-5 w-5 text-white" />
              </div>
              <div className="font-semibold">{c.name}</div>
              <div className="text-xs text-muted-foreground">{c.count} notes</div>
            </div>
          ))} */}
        </div>

        <h2 className="text-xl font-semibold font-display mb-4 flex items-center justify-between">
          <span>{activeCollection ? `Collection: ${activeCollection}` : "Recently saved"}</span>
        </h2>

        {isLoading ? (
          <div className="glass rounded-2xl p-10 text-center text-muted-foreground text-sm">
            Loading bookmarks…
          </div>
        ) : displayNotes.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center text-muted-foreground text-sm">
            {activeCollection
              ? "No bookmarks in this collection."
              : "No bookmarks yet. Save notes from the feed to see them here."}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {displayNotes.map((n) => (
              <div key={n.noteId} className="relative group">
                <NoteCard note={n} />
                <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  {/* <select
                    className="text-xs glass-strong rounded-full px-2 py-1 bg-black/80 text-white border border-white/20 outline-none"
                    value={n._collection || ""}
                    onChange={(e) => {
                      updateBookmark.mutate({ noteId: n.noteId, collection: e.target.value });
                    }}
                    disabled={updateBookmark.isPending}
                  >
                    <option value="">No Collection</option>
                    {DEFAULT_COLLECTIONS.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select> */}
                </div>
                <button
                  onClick={() => deleteBookmark.mutate(n.noteId)}
                  disabled={deleteBookmark.isPending}
                  className="absolute top-14 right-3 h-8 w-8 grid place-items-center rounded-full glass-strong hover:bg-danger hover:text-white transition opacity-0 group-hover:opacity-100 z-10 disabled:opacity-60"
                  title="Remove from bookmarks"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
