import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import {
  Activity,
  AlertTriangle,
  Cloud,
  Download,
  FileText,
  HardDrive,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useEffect } from "react";
import { isAdmin } from "@/lib/auth";
import { usePublicNotes } from "@/hooks/useNotes";

import { useAdminStats } from "@/hooks/useAdminStats";

export const Route = createFileRoute("/admin")({ component: AdminPage });

const pie = [
  { name: "Active", value: 62, color: "#6366F1" },
  { name: "Idle", value: 24, color: "#06B6D4" },
  { name: "Dormant", value: 14, color: "#F59E0B" },
];

function AdminPage() {
  const navigate = useNavigate();

  // Route-level guard: redirect non-admin users immediately
  useEffect(() => {
    if (!isAdmin()) {
      navigate({ to: "/dashboard" });
    }
  }, [navigate]);

  // Fetch real public notes for the "Most downloaded" list and trending subjects
  const { data: publicNotes = [], isLoading: notesLoading } = usePublicNotes();

const { data: stats } = useAdminStats();

  if (!isAdmin()) {
    // Render nothing while redirecting
    return null;
  }

  // Compute trending subjects from real notes
  const subjectCounts: Record<string, number> = {};
  publicNotes.forEach((n) => {
    if (n.subject) {
      subjectCounts[n.subject] = (subjectCounts[n.subject] ?? 0) + 1;
    }
  });
  const trendingSubjects = Object.entries(subjectCounts)
    .map(([subject, value]) => ({ subject, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Sort notes by downloads for "Most downloaded" list
  const topNotes = [...publicNotes]
    .sort((a, b) => (b.downloads ?? 0) - (a.downloads ?? 0))
    .slice(0, 6);

  // Compute activity chart: notes created per day for last 7 days
  const today = new Date();
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const activityMap: Record<string, { uploads: number; downloads: number }> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = dayLabels[d.getDay()];
    activityMap[key] = { uploads: 0, downloads: 0 };
  }
  publicNotes.forEach((n) => {
    if (n.createdAt) {
      const d = new Date(n.createdAt);
      const key = dayLabels[d.getDay()];
      if (key in activityMap) {
        activityMap[key].uploads += 1;
        activityMap[key].downloads += n.downloads ?? 0;
      }
    }
  });
  const activityData = Object.entries(activityMap).map(([day, v]) => ({ day, ...v }));

  // Aggregate totals
  const totalNotes = publicNotes.length;
  const totalDownloads = publicNotes.reduce((s, n) => s + (n.downloads ?? 0), 0);

  return (
    <AppShell>
      <div className="p-6 md:p-10 max-w-7xl mx-auto animate-fade-up">
        <PageHeader
          eyebrow="Admin"
          title={
            <>
              Platform <span className="text-gradient">overview</span>
            </>
          }
          description="Real-time insights into users, storage, and content."
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Notes"
            value={totalNotes}
            delta="public notes"
            icon={FileText}
            accent="primary"
          />
          <StatCard
            label="Total Downloads"
            value={totalDownloads}
            delta="across all notes"
            icon={Download}
            accent="secondary"
          />
          <StatCard
    label="Total Users"
    value={stats?.data?.totalUsers ?? 0}
    delta="registered users"
    icon={Users}
    accent="success"
/>
          <StatCard
            label="Storage Used"
            value={0}
            delta="backend endpoint needed"
            icon={HardDrive}
            accent="warning"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-4 mt-6">
          <div className="glass rounded-2xl p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Activity — last 7 days</h3>
                <p className="text-xs text-muted-foreground">Uploads & downloads by day of week</p>
              </div>
              <span className="text-xs text-success inline-flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" /> Healthy
              </span>
            </div>
            <div className="h-64">
              <ResponsiveContainer>
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="a1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366F1" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="a2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#EC4899" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#EC4899" stopOpacity={0} />
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
                    fill="url(#a1)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="downloads"
                    stroke="#EC4899"
                    fill="url(#a2)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold">User activity</h3>
            <p className="text-xs text-muted-foreground mb-4">Segmentation</p>
            <div className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pie}
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pie.map((p) => (
                      <Cell key={p.name} fill={p.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "rgba(17,24,39,0.9)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 -mt-4">
              {pie.map((p) => (
                <div
                  key={p.name}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: p.color }} /> {p.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 mt-6">
          <div className="glass rounded-2xl p-6 lg:col-span-2">
            <h3 className="font-semibold mb-4">Most downloaded notes</h3>
            <div className="space-y-3">
              {notesLoading ? (
                <div className="text-sm text-muted-foreground">Loading…</div>
              ) : topNotes.length === 0 ? (
                <div className="text-sm text-muted-foreground">No notes available.</div>
              ) : (
                topNotes.map((n, i) => (
                  <div key={n.noteId} className="flex items-center gap-3">
                    <div className="text-xs w-6 text-muted-foreground">#{i + 1}</div>
                    <div className="h-10 w-10 rounded-lg shrink-0 bg-gradient-to-br from-primary/40 to-secondary/40" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm truncate">{n.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {n.author?.fullName ?? n.author?.name ?? "Unknown"} · {n.subject}
                      </div>
                    </div>
                    <div className="text-sm inline-flex items-center gap-1">
                      <Download className="h-3.5 w-3.5" /> {(n.downloads ?? 0).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold mb-4">Trending subjects</h3>
            <div className="h-56">
              {trendingSubjects.length > 0 ? (
                <ResponsiveContainer>
                  <BarChart data={trendingSubjects}>
                    <XAxis dataKey="subject" stroke="rgba(255,255,255,0.4)" fontSize={10} />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(17,24,39,0.9)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 12,
                      }}
                    />
                    <Bar dataKey="value" fill="#06B6D4" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  {notesLoading ? "Loading…" : "No subject data."}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 mt-6">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Recent reports</h3>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </div>
            <div className="text-sm text-muted-foreground py-6 text-center">
              Reporting backend endpoint not yet available.
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold mb-4">System</h3>
            <div className="space-y-3">
              {[
                { l: "API latency", v: "—", ok: true },
                { l: "Error rate", v: "—", ok: true },
                { l: "Uptime", v: "—", ok: true },
                { l: "Storage growth", v: "—", ok: true },
              ].map((m) => (
                <div
                  key={m.l}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5"
                >
                  <div className="inline-flex items-center gap-2 text-sm">
                    <Cloud className="h-4 w-4 text-muted-foreground" /> {m.l}
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">{m.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
