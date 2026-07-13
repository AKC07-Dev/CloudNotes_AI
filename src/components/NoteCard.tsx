import { Link } from "@tanstack/react-router";
import { Bookmark, Download, Eye, Heart, MessageCircle, Share2, FileText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useDownloadNote, type NoteData } from "@/hooks/useNotes";
import {
  useLikeNote,
  useUnlikeNote,
  useLikes,
  useAddBookmark,
  useDeleteBookmark,
  useBookmarks,
} from "@/hooks/useInteractions";

function fmt(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return n.toString();
}

export function NoteCard({ note }: { note: NoteData }) {
  const downloadNote = useDownloadNote();

  const { data: likes = [] } = useLikes();
  const { data: bookmarks = [] } = useBookmarks();

  const likeNote = useLikeNote();
  const unlikeNote = useUnlikeNote();
  const addBookmark = useAddBookmark();
  const deleteBookmark = useDeleteBookmark();

  const isLiked = likes.includes(note.noteId);
  const isBookmarked = bookmarks.some((b) => b.noteId === note.noteId);

  const views = note.views ?? 0;
  const downloads = note.downloads ?? 0;
  const tags = note.tags ?? [];

  // Gracefully handle potentially-missing createdAt
  const dateLabel = note.createdAt ? new Date(note.createdAt).toLocaleDateString() : "";

  return (
    <article className="group glass rounded-2xl overflow-hidden hover:shadow-premium hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <Link
        to="/note/$id"
        params={{ id: note.noteId }}
        className="relative block aspect-[4/3] overflow-hidden"
      >
        <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105 bg-gradient-to-br from-primary/60 to-secondary/60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <FileText className="h-12 w-12 text-white/30" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="glass-strong text-xs px-2.5 py-1 rounded-full font-medium">
            {note.subject}
          </span>
          <span className="glass-strong text-xs px-2.5 py-1 rounded-full text-muted-foreground">
            Semester {note.semester}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            if (isBookmarked) {
              deleteBookmark.mutate(note.noteId);
            } else {
              addBookmark.mutate({ noteId: note.noteId });
            }
          }}
          disabled={addBookmark.isPending || deleteBookmark.isPending}
          className="absolute top-3 right-3 h-9 w-9 grid place-items-center rounded-full glass-strong hover:shadow-glow transition disabled:opacity-60"
        >
          <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-primary text-primary" : ""}`} />
        </button>
        <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white/90">
          <FileText className="h-4 w-4" />
          <span className="text-xs font-medium">PDF · {note.department}</span>
        </div>
      </Link>

      <div className="p-4 flex-1 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            {dateLabel && (
              <p className="text-[11px] text-muted-foreground truncate">
                {note.semester} · {dateLabel}
              </p>
            )}
          </div>
        </div>

        <Link to="/note/$id" params={{ id: note.noteId }} className="min-w-0">
          <h3 className="font-semibold text-base leading-snug line-clamp-2 group-hover:text-gradient transition">
            {note.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{note.description}</p>
        </Link>

        <div className="flex flex-wrap gap-1.5">
          {tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-md bg-white/5 text-muted-foreground"
            >
              #{t}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/5 text-muted-foreground text-xs">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" /> {fmt(views)}
            </span>
            <button
              onClick={async () => {
                try {
                  downloadNote.mutate(note.noteId);
                } catch {
                  // Error handled in hook
                }
              }}
              disabled={downloadNote.isPending}
              className="flex items-center gap-1 hover:text-foreground disabled:opacity-60"
            >
              <Download className="h-3.5 w-3.5" />
              {fmt(downloads)}
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.preventDefault();
                if (isLiked) {
                  unlikeNote.mutate(note.noteId);
                } else {
                  likeNote.mutate(note.noteId);
                }
              }}
              disabled={likeNote.isPending || unlikeNote.isPending}
              className="h-8 w-8 grid place-items-center rounded-lg hover:bg-white/5 transition disabled:opacity-60"
              aria-label="Like"
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-danger text-danger" : ""}`} />
            </button>
            <Link
              to="/note/$id"
              params={{ id: note.noteId }}
              className="h-8 w-8 grid place-items-center rounded-lg hover:bg-white/5 transition"
              aria-label="Comments"
            >
              <MessageCircle className="h-4 w-4" />
            </Link>
            <button
              onClick={(e) => {
                e.preventDefault();
                const url = `${window.location.origin}/note/${note.noteId}`;
                navigator.clipboard.writeText(url);
                toast.success("Link copied");
              }}
              className="h-8 w-8 grid place-items-center rounded-lg hover:bg-white/5 transition"
              aria-label="Share"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
