import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import {
  BadgeCheck,
  Bookmark,
  Download,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  ThumbsUp,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { NoteCard } from "@/components/NoteCard";
import { toast } from "sonner";
import { useState } from "react";
import { useNote, usePublicNotes, useDownloadNote } from "@/hooks/useNotes";
import {
  useLikeNote,
  useUnlikeNote,
  useLikes,
  useAddBookmark,
  useDeleteBookmark,
  useBookmarks,
  useFollows,
  useFollowUser,
  useUnfollowUser,
  useComments,
  useCreateComment,
  useDeleteComment,
} from "@/hooks/useInteractions";
import { getUser } from "@/lib/auth";


export const Route = createFileRoute("/note/$id")({ component: NoteDetail });

function NoteDetail() {
  const { id } = Route.useParams();
  const [page, setPage] = useState(1);

  const { data: note, isLoading, isError } = useNote(id);
  const { data: publicNotes = [] } = usePublicNotes();
  const downloadNote = useDownloadNote();

  // Interactions
  const { data: likes = [] } = useLikes();
  const { data: bookmarks = [] } = useBookmarks();
  const { data: follows = [] } = useFollows();

  const likeNote = useLikeNote();
  const unlikeNote = useUnlikeNote();
  const addBookmark = useAddBookmark();
  const deleteBookmark = useDeleteBookmark();
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  

  const isLiked = note ? likes.includes(note.noteId) : false;
  const isBookmarked = note ? bookmarks.some((b) => b.noteId === note.noteId) : false;
  const isFollowing = note?.author?.userId ? follows.includes(note.author.userId) : false;

  // Comments
  const { data: comments = [], isLoading: commentsLoading } = useComments(id);
  const createComment = useCreateComment();
  const deleteComment = useDeleteComment();
  const [newComment, setNewComment] = useState("");
  const currentUser = getUser();

  if (isLoading) {
    return (
      <AppShell>
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          <div className="text-center py-20 text-muted-foreground">Loading note…</div>
        </div>
      </AppShell>
    );
  }

  if (isError || !note) {
    return (
      <AppShell>
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          <div className="text-center py-20 text-muted-foreground">Note not found.</div>
        </div>
      </AppShell>
    );
  }

  const relatedNotes = publicNotes.filter((n) => n.noteId !== note.noteId).slice(0, 4);

  const authorName = note.author?.fullName ?? note.author?.name ?? "Unknown";
  const authorAvatar =
    note.author?.avatar ??
    `https://ui-avatars.com/api/?background=6366F1&color=fff&name=${encodeURIComponent(authorName)}`;
  const authorDept = note.author?.department ?? note.department ?? "";
  const totalPages = 1; // Backend doesn't expose page count; set to 1

  return (
    <AppShell>
      <div className="p-6 md:p-10 max-w-7xl mx-auto animate-fade-up">
        <div className="text-xs text-muted-foreground mb-4">
          <Link to="/feed" className="hover:text-foreground">
            Feed
          </Link>{" "}
          / <span>{note.subject}</span> / <span className="text-foreground">{note.title}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass rounded-2xl overflow-hidden">
              <div
                className="aspect-[16/10] relative"
                style={{ background: "linear-gradient(135deg,#6366F1,#06B6D4)" }}
              >
                <div className="absolute inset-0 grid place-items-center">
                  <div className="glass-strong rounded-2xl p-6 text-center">
                    <FileText className="h-10 w-10 mx-auto mb-2 opacity-80" />
                    <div className="text-sm">
                      PDF Preview · Page {page} of {totalPages}
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 glass-strong rounded-full px-2 py-1">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    className="h-8 w-8 grid place-items-center rounded-full hover:bg-white/10"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-xs px-2">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    className="h-8 w-8 grid place-items-center rounded-full hover:bg-white/10"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <span className="text-xs glass rounded-full px-2.5 py-1">{note.subject}</span>
                <span className="text-xs glass rounded-full px-2.5 py-1 text-muted-foreground">
                  {note.department} · Sem {note.semester}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold font-display">{note.title}</h1>
              <p className="mt-3 text-muted-foreground">{note.description}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {(note.tags ?? []).map((t) => (
                  <span
                    key={t}
                    className="text-[11px] uppercase tracking-wide px-2 py-1 rounded-md bg-white/5 text-muted-foreground"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Comments · {comments.length}</h3>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newComment.trim()) return;
                  createComment.mutate(
                    { noteId: note.noteId, comment: newComment.trim() },
                    { onSuccess: () => setNewComment("") },
                  );
                }}
                className="flex items-center gap-3 mb-6"
              >
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/40 to-secondary/40 shrink-0" />
                <input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts…"
                  className="flex-1 glass rounded-xl h-10 px-3 text-sm bg-transparent outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() || createComment.isPending}
                  className="h-10 px-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm disabled:opacity-60"
                >
                  Post
                </button>
              </form>

              {commentsLoading ? (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  Comments are loading…
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  No comments yet. Be the first to share your thoughts!
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((c) => (
                    <div key={c.commentId} className="flex gap-3">
                      <img
  src={
    c.author?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      c.author?.name || "User"
    )}`
  }
  className="h-9 w-9 rounded-full object-cover shrink-0"
/>
                      <div className="flex-1">
                        <div className="flex items-baseline justify-between">
                          <div className="text-sm font-medium">
  {c.author?.name || "User"}
</div>
                          <div className="flex items-center gap-2">
  <div className="text-xs text-muted-foreground">
    {new Date(c.createdAt).toLocaleDateString()}
  </div>
  {currentUser?.userId === c.userId && (
  <button
    onClick={() => {
      if (confirm("Delete this comment?")) {
        deleteComment.mutate({
          id: c.commentId,
          noteId: note.noteId,
        });
      }
    }}
    className="text-xs text-danger hover:underline"
  >
    Delete
  </button>
)}
</div>
                        </div>
                        <p className="text-sm mt-1 text-muted-foreground">{c.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <img
                  src={authorAvatar}
                  className="h-12 w-12 rounded-xl ring-1 ring-white/10"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      `https://ui-avatars.com/api/?background=6366F1&color=fff&name=${encodeURIComponent(authorName)}`;
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 text-sm font-medium">
                    {authorName}
                    {note.author?.verified && <BadgeCheck className="h-3.5 w-3.5 text-secondary" />}
                  </div>
                  <div className="text-xs text-muted-foreground">{authorDept}</div>
                </div>
                <button
                  onClick={() => {
                    if (!note.author?.userId) return;
                    if (isFollowing) unfollowUser.mutate(note.author.userId);
                    else followUser.mutate(note.author.userId);
                  }}
                  disabled={!note.author?.userId || followUser.isPending || unfollowUser.isPending}
                  className="h-8 px-3 rounded-lg bg-white/10 text-xs hover:bg-white/15 disabled:opacity-60"
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                <StatBox label="Downloads" value={note.downloads ?? 0} />
                <StatBox label="Likes" value={note.likes ?? 0} />
                <StatBox label="Views" value={note.views ?? 0} />
              </div>
            </div>

            <div className="glass rounded-2xl p-4 space-y-2">
              <button
                onClick={() => downloadNote.mutate(note.noteId)}
                disabled={downloadNote.isPending}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground font-medium inline-flex items-center justify-center gap-2 hover:shadow-glow disabled:opacity-60"
              >
                <Download className="h-4 w-4" />
                {downloadNote.isPending ? "Getting link…" : "Download PDF"}
              </button>
              <div className="grid grid-cols-3 gap-2">
                <IconBtn
                  icon={Heart}
                  label="Like"
                  active={isLiked}
                  disabled={likeNote.isPending || unlikeNote.isPending}
                  onClick={() => {
                    if (isLiked) unlikeNote.mutate(note.noteId);
                    else likeNote.mutate(note.noteId);
                  }}
                />
                <IconBtn
                  icon={Bookmark}
                  label="Save"
                  active={isBookmarked}
                  disabled={addBookmark.isPending || deleteBookmark.isPending}
                  onClick={() => {
                    if (isBookmarked) deleteBookmark.mutate(note.noteId);
                    else addBookmark.mutate({ noteId: note.noteId });
                  }}
                />
                <IconBtn
                  icon={Share2}
                  label="Share"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Link copied");
                  }}
                />
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <h4 className="text-sm font-semibold mb-3">Stats</h4>
              <div className="space-y-2 text-sm">
                <Row icon={Eye} label="Views" value={(note.views ?? 0).toLocaleString()} />
                <Row
                  icon={Download}
                  label="Downloads"
                  value={(note.downloads ?? 0).toLocaleString()}
                />
                <Row icon={Heart} label="Likes" value={(note.likes ?? 0).toLocaleString()} />
                <Row icon={MessageCircle} label="Comments" value={comments.length} />
              </div>
            </div>
          </aside>
        </div>

        {relatedNotes.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold font-display mb-4">More like this</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedNotes.map((n) => (
                <NoteCard key={n.noteId} note={n} />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass rounded-lg py-2">
      <div className="text-sm font-semibold">{value.toLocaleString()}</div>
      <div className="text-[10px] uppercase text-muted-foreground">{label}</div>
    </div>
  );
}

function IconBtn({
  icon: Icon,
  label,
  onClick,
  active,
  disabled,
}: {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="h-10 rounded-xl glass hover:bg-white/10 text-xs inline-flex flex-col items-center justify-center gap-0.5 disabled:opacity-60"
    >
      <Icon className={`h-4 w-4 ${active ? "fill-current text-primary" : ""}`} /> {label}
    </button>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground inline-flex items-center gap-2">
        <Icon className="h-3.5 w-3.5" /> {label}
      </span>
      <span>{value}</span>
    </div>
  );
}
