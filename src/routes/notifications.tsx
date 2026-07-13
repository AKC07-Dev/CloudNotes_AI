import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Bell } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/notifications")({ component: NotificationsPage });

const tabs = ["All", "Mentions", "Follows", "System"];

function NotificationsPage() {
  const [tab, setTab] = useState("All");

  return (
    <AppShell>
      <div className="p-6 md:p-10 max-w-4xl mx-auto animate-fade-up">
        <PageHeader
          eyebrow="Inbox"
          title="Notifications"
          description="Stay on top of what matters."
          actions={
            <button className="h-9 px-3 text-sm text-muted-foreground hover:text-foreground">
              Mark all read
            </button>
          }
        />

        <div className="glass rounded-xl p-1 inline-flex gap-1 mb-4">
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

        <div className="glass rounded-2xl p-10 text-center text-muted-foreground">
          <Bell className="h-8 w-8 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No notifications yet.</p>
          <p className="text-xs mt-1 opacity-60">
            Notifications will appear here when people interact with your notes.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
