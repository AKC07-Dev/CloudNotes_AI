import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { NoteCard } from "@/components/NoteCard";
import { BadgeCheck, Calendar, Edit3, MapPin, Trophy } from "lucide-react";
import { useState, useMemo } from "react";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";
import { useMyNotes } from "@/hooks/useNotes";
import { useFollows } from "@/hooks/useInteractions";
import { useBookmarks } from "@/hooks/useInteractions";
import { usePublicNotes } from "@/hooks/useNotes";

export const Route = createFileRoute("/profile")({ component: Profile });

const tabs = ["Uploads", "Bookmarks", "Timeline", "Achievements"];

const FALLBACK_AVATAR = "https://ui-avatars.com/api/?background=6366F1&color=fff&name=User";

/**
 * Compute achievements from real note statistics.
 * Achievements are earned when a threshold is met.
 */
function computeAchievements(noteCount: number, totalDownloads: number, totalLikes: number) {
  return [
    {
      icon: "📚",
      label: "First Upload",
      desc: "Shared your first note with the community",
      earned: noteCount >= 1,
    },
    {
      icon: "🚀",
      label: "10 Uploads",
      desc: "Shared 10+ notes with the community",
      earned: noteCount >= 10,
    },
    {
      icon: "💎",
      label: "100 Downloads",
      desc: "Notes downloaded 100+ times total",
      earned: totalDownloads >= 100,
    },
    {
      icon: "🏆",
      label: "1K Downloads",
      desc: "Notes downloaded 1,000+ times total",
      earned: totalDownloads >= 1000,
    },
    {
      icon: "❤️",
      label: "50 Likes",
      desc: "Received 50+ likes on your notes",
      earned: totalLikes >= 50,
    },
    {
      icon: "⭐",
      label: "100 Uploads",
      desc: "Shared 100+ notes with the community",
      earned: noteCount >= 100,
    },
  ];
}

function Profile() {
  const [tab, setTab] = useState("Uploads");
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: myNotes = [], isLoading: notesLoading } = useMyNotes();
  const { data: follows = [] } = useFollows();

  const avatar = profile?.profileImage ?? profile?.avatar ?? FALLBACK_AVATAR;
  const name = profile?.fullName ?? "—";
  const handle = profile?.username ?? profile?.userId ?? "";
  const bio = profile?.bio ?? "";
  const department = profile?.department ?? "";

  const { data: bookmarks = [], isLoading: bookmarksLoading } = useBookmarks();

const { data: allNotes = [], isLoading: publicNotesLoading } = usePublicNotes();


const bookmarkedNotes = useMemo(() => {
  return bookmarks
    .map((b) => allNotes.find((n) => n.noteId === b.noteId))
    .filter(Boolean);
}, [bookmarks, allNotes]);

  // Derive join date from profile.createdAt if available
  const joinedText = useMemo(() => {
    if (profile?.createdAt) {
      const d = new Date(profile.createdAt);
      return `Joined ${d.toLocaleDateString("en-US", { month: "short", year: "numeric" })}`;
    }
    return null;
  }, [profile]);

  // Compute stats from real notes
  const totalDownloads = useMemo(
    () => myNotes.reduce((s, n) => s + (n.downloads ?? 0), 0),
    [myNotes],
  );
  const totalLikes = useMemo(() => myNotes.reduce((s, n) => s + (n.likes ?? 0), 0), [myNotes]);

  // Compute achievements from real data
  const achievements = useMemo(
    () => computeAchievements(myNotes.length, totalDownloads, totalLikes),
    [myNotes.length, totalDownloads, totalLikes],
  );

  // Timeline events derived from real note data
  const timelineEvents = useMemo(() => {
    const events: { t: string; s: string }[] = [];

    if (profile?.createdAt) {
      const d = new Date(profile.createdAt);
      events.push({
        t: "Joined CloudNotes AI",
        s: d.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      });
    } else {
      events.push({ t: "Joined CloudNotes AI", s: "this year" });
    }

    // Last 3 notes as timeline entries
    const sorted = [...myNotes]
      .filter((n) => n.createdAt)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, 3);

    sorted.forEach((n) => {
      const d = new Date(n.createdAt!);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      const when =
        diffDays === 0
          ? "today"
          : diffDays === 1
            ? "yesterday"
            : diffDays < 7
              ? `${diffDays} days ago`
              : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      events.unshift({ t: `Uploaded "${n.title}"`, s: when });
    });

    return events;
  }, [myNotes, profile]);

  return (
    <AppShell>
      <div className="animate-fade-up">
        <div className="h-48 md:h-64 relative overflow-hidden">
          <div
            className="absolute inset-0 animate-gradient"
            style={{
              background: "linear-gradient(120deg, #6366F1, #06B6D4, #EC4899, #6366F1)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="-mt-20 flex flex-wrap items-end gap-4 relative">
            <img
              src={avatar}
              className="h-32 w-32 rounded-3xl ring-4 ring-background object-cover shadow-premium"
              onError={(e) => {
                (e.target as HTMLImageElement).src = FALLBACK_AVATAR;
              }}
            />
            <div className="flex-1 min-w-0">
              {profileLoading ? (
                <div className="h-8 w-48 rounded-lg bg-white/10 animate-pulse" />
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl md:text-3xl font-bold font-display">{name}</h1>
                    {profile?.verified && <BadgeCheck className="h-5 w-5 text-secondary" />}
                  </div>
                  <div className="text-sm text-muted-foreground">@{handle}</div>
                  <p className="mt-2 max-w-xl text-sm">{bio}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                    {department && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {department}
                      </span>
                    )}
                    {joinedText && (
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> {joinedText}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-2">
              
              <button
                onClick={() => {
                  const url = `${window.location.origin}/profile/${handle}`;
                  navigator.clipboard.writeText(url);
                  toast.success("Profile link copied!");
                }}
                className="h-10 px-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm hover:shadow-glow"
              >
                Share profile
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { l: "Followers", v: profile?.followers ?? 0 },
              { l: "Following", v: Math.max(profile?.following ?? 0, follows.length) },
              { l: "Downloads", v: totalDownloads },
              { l: "Uploads", v: profile?.uploads ?? myNotes.length },
            ].map((s) => (
              <div key={s.l} className="glass rounded-2xl p-4">
                <div className="text-2xl font-bold font-display">
                  <AnimatedCounter value={s.v} />
                </div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 glass rounded-xl p-1 inline-flex gap-1">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`h-9 px-4 rounded-lg text-sm ${tab === t ? "bg-white/10" : "text-muted-foreground"}`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === "Uploads" && (
            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-16">
              {notesLoading ? (
                <div className="col-span-full text-center py-10 text-muted-foreground text-sm">
                  Loading notes…
                </div>
              ) : myNotes.length === 0 ? (
                <div className="col-span-full text-center py-10 text-muted-foreground text-sm">
                  No uploads yet.
                </div>
              ) : (
                myNotes.map((n) => <NoteCard key={n.noteId} note={n} />)
              )}
            </div>
          )}
          {tab === "Bookmarks" && (
  <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-16">
    {bookmarksLoading || publicNotesLoading ? (
      <div className="col-span-full text-center py-10 text-muted-foreground">
        Loading bookmarks...
      </div>
    ) : bookmarkedNotes.length === 0 ? (
      <div className="col-span-full text-center py-10 text-muted-foreground">
        No bookmarks yet.
      </div>
    ) : (
      bookmarkedNotes.map((note) => <NoteCard key={note.noteId} note={note} />)
    )}
  </div>
)}
          {tab === "Timeline" && (
            <div className="mt-6 glass rounded-2xl p-6 pb-16">
              <div className="space-y-6 relative">
                <div className="absolute top-0 bottom-0 left-4 w-px bg-white/10" />
                {timelineEvents.map((a, i) => (
                  <div key={i} className="pl-12 relative">
                    <div className="absolute left-3 top-2 h-2.5 w-2.5 rounded-full bg-primary shadow-glow" />
                    <div className="text-sm">{a.t}</div>
                    <div className="text-xs text-muted-foreground">{a.s}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === "Achievements" && (
            <div className="mt-6 grid sm:grid-cols-2 md:grid-cols-3 gap-4 pb-16">
              {achievements.filter((a) => a.earned).length === 0 && !notesLoading ? (
                <div className="col-span-full text-center py-10 text-muted-foreground text-sm">
                  Start uploading notes to earn achievements.
                </div>
              ) : (
                achievements
                  .filter((a) => a.earned)
                  .map((a) => (
                    <div
                      key={a.label}
                      className="glass rounded-2xl p-5 flex gap-4 hover:shadow-premium transition"
                    >
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-warning/40 to-danger/40 grid place-items-center text-2xl">
                        {a.icon}
                      </div>
                      <div>
                        <div className="font-semibold inline-flex items-center gap-1">
                          {a.label} <Trophy className="h-3.5 w-3.5 text-warning" />
                        </div>
                        <div className="text-sm text-muted-foreground">{a.desc}</div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
