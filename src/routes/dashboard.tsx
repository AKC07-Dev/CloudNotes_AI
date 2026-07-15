import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Bookmark, Download, TrendingUp, Upload, Users } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { NoteCard } from "@/components/NoteCard";
import { useProfile } from "@/hooks/useProfile";
import { useMyNotes } from "@/hooks/useNotes";
import { useBookmarks, useFollows } from "@/hooks/useInteractions";
import { useMemo } from "react";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function Dashboard() {
  const { data: profile } = useProfile();
  const { data: myNotes = [], isLoading: notesLoading } = useMyNotes();
  const { data: bookmarks = [] } = useBookmarks();
  const { data: follows = [] } = useFollows();

  const firstName = profile?.fullName?.split(" ")[0] ?? "there";

  // ── Compute stats from real notes ─────────────────────────────────────────

  const totalDownloads = useMemo(
    () => myNotes.reduce((s, n) => s + (n.downloads ?? 0), 0),
    [myNotes],
  );

  const totalLikes = useMemo(() => myNotes.reduce((s, n) => s + (n.likes ?? 0), 0), [myNotes]);

  // ── Activity chart: uploads per day of week from real notes ───────────────

  const activityData = useMemo(() => {
    const today = new Date();
    const map: Record<string, { day: string; uploads: number; downloads: number }> = {};

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = DAY_LABELS[d.getDay()];
      if (!(key in map)) {
        map[key] = { day: key, uploads: 0, downloads: 0 };
      }
    }

    myNotes.forEach((n) => {
      if (n.createdAt) {
        const d = new Date(n.createdAt);
        const key = DAY_LABELS[d.getDay()];
        if (key in map) {
          map[key].uploads += 1;
          map[key].downloads += n.downloads ?? 0;
        }
      }
    });

    return Object.values(map);
  }, [myNotes]);

  // ── Trending subjects from real notes ─────────────────────────────────────

  const trendingSubjects = useMemo(() => {
    const counts: Record<string, number> = {};
    myNotes.forEach((n) => {
      if (n.subject) {
        counts[n.subject] = (counts[n.subject] ?? 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([subject, value]) => ({ subject, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [myNotes]);

  // ── Recent activity derived from note creation dates ──────────────────────

  const recentActivity = useMemo(() => {
    const sorted = [...myNotes]
      .filter((n) => n.createdAt)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, 5);

    return sorted.map((n) => {
      const created = new Date(n.createdAt!);
      const now = new Date();
      const diffMs = now.getTime() - created.getTime();
      const diffH = Math.floor(diffMs / (1000 * 60 * 60));
      const diffD = Math.floor(diffH / 24);
      const when =
        diffH < 1
          ? "just now"
          : diffH < 24
            ? `${diffH} hour${diffH > 1 ? "s" : ""} ago`
            : `${diffD} day${diffD > 1 ? "s" : ""} ago`;

      return { t: `You uploaded "${n.title}"`, s: when };
    });
  }, [myNotes]);

  return (
    <AppShell>
      <div className="p-6 md:p-10 max-w-7xl mx-auto animate-fade-up">
        <PageHeader
          eyebrow={`Welcome back, ${firstName}`}
          title={
            <>
              Your study, in <span className="text-gradient">clear focus</span>.
            </>
          }
          description="Here's what's happening across your notes, communities, and audience."
          actions={
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm font-medium hover:shadow-glow transition"
            >
              <Upload className="h-4 w-4" /> New upload
            </Link>
          }
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard
            label="Uploads"
            value={profile?.uploads ?? myNotes.length}
            delta={`${myNotes.length} total`}
            icon={Upload}
            accent="primary"
          />
          <StatCard
            label="Downloads"
            value={totalDownloads}
            delta="across all notes"
            icon={Download}
            accent="secondary"
          />
          <StatCard
            label="Followers"
            value={profile?.followers ?? 0}
            delta="total followers"
            icon={Users}
            accent="success"
          />
          <StatCard
            label="Following"
            value={Math.max(profile?.following ?? 0, follows.length)}
            delta="total following"
            icon={Users}
            accent="warning"
          />
          <StatCard
            label="Bookmarks"
            value={bookmarks.length}
            delta="saved notes"
            icon={Bookmark}
            accent="primary"
          />
          {/* <StatCard
            label="Likes"
            value={totalLikes}
            delta="across all notes"
            icon={Heart}
            accent="danger"
          /> */}
        </div>

        <div className="grid lg:grid-cols-3 gap-4 mt-6">
          <div className="glass rounded-2xl p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Activity — last 7 days</h3>
                <p className="text-xs text-muted-foreground">
                  Uploads &amp; downloads across all notes
                </p>
              </div>
              <div className="inline-flex items-center gap-1 text-xs text-success">
                <TrendingUp className="h-3.5 w-3.5" /> your uploads
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer>
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366F1" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#06B6D4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" fontSize={12} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(17,24,39,0.9)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="uploads"
                    stroke="#6366F1"
                    fill="url(#g1)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="downloads"
                    stroke="#06B6D4"
                    fill="url(#g2)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold">Trending subjects</h3>
            <p className="text-xs text-muted-foreground mb-4">Across your uploads</p>
            <div className="h-64">
              {trendingSubjects.length > 0 ? (
                <ResponsiveContainer>
                  <BarChart data={trendingSubjects} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="subject"
                      stroke="rgba(255,255,255,0.6)"
                      fontSize={11}
                      width={100}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(17,24,39,0.9)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 12,
                      }}
                    />
                    <Bar dataKey="value" fill="#6366F1" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  {notesLoading ? "Loading…" : "Upload notes to see trending subjects."}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold font-display">Recent uploads</h2>
            <Link to="/feed" className="text-sm text-muted-foreground hover:text-foreground">
              View all →
            </Link>
          </div>
          {notesLoading ? (
            <div className="text-center py-10 text-muted-foreground text-sm">Loading notes…</div>
          ) : myNotes.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              No uploads yet.{" "}
              <Link to="/upload" className="text-primary underline">
                Upload your first note
              </Link>
              .
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {myNotes.slice(0, 6).map((n) => (
                <NoteCard key={n.noteId} note={n} />
              ))}
            </div>
          )}
        </div>

        <div className="mt-10 grid lg:grid-cols-2 gap-4">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Top performing notes</h3>
              <Download className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {myNotes
                .slice()
                .sort((a, b) => (b.downloads ?? 0) - (a.downloads ?? 0))
                .slice(0, 5)
                .map((n, i) => (
                  <div key={n.noteId} className="flex items-center gap-3">
                    <div className="text-xs w-6 text-muted-foreground">#{i + 1}</div>
                    <div className="h-10 w-10 rounded-lg shrink-0 bg-gradient-to-br from-primary/40 to-secondary/40" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm truncate">{n.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {n.subject} · {n.downloads ?? 0} downloads
                      </div>
                    </div>
                    <Bookmark className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              {myNotes.length === 0 && !notesLoading && (
                <div className="text-sm text-muted-foreground">No notes yet.</div>
              )}
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold mb-4">Recent activity</h3>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  {notesLoading ? "Loading…" : "No activity yet. Upload a note to get started."}
                </div>
              ) : (
                recentActivity.map((a, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary shadow-glow shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm">{a.t}</div>
                      <div className="text-xs text-muted-foreground">{a.s}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
