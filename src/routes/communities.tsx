import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Users, Plus } from "lucide-react";

export const Route = createFileRoute("/communities")({ component: CommunitiesPage });

function CommunitiesPage() {
  return (
    <AppShell>
      <div className="p-6 md:p-10 max-w-7xl mx-auto animate-fade-up">
        <PageHeader
          eyebrow="Communities"
          title="Learn with your people"
          description="Join subject-based communities to chat, share notes, and study together."
          actions={
            <button className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm font-medium hover:shadow-glow">
              <Plus className="h-4 w-4" /> New community
            </button>
          }
        />

        <div className="glass rounded-2xl p-12 text-center text-muted-foreground">
          <Users className="h-10 w-10 mx-auto mb-4 opacity-40" />
          <p className="text-base font-medium">Communities coming soon</p>
          <p className="text-sm mt-2 opacity-60">
            Subject-based communities are being built. Check back soon to join, chat, and share
            notes with your peers.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
