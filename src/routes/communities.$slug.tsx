import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Users } from "lucide-react";

export const Route = createFileRoute("/communities/$slug")({ component: CommunityPage });

function CommunityPage() {
  const { slug } = Route.useParams();

  return (
    <AppShell>
      <div className="animate-fade-up">
        <div
          className="h-40 md:h-56 relative"
          style={{ background: "linear-gradient(135deg,#6366F1,#06B6D4)" }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="-mt-16 flex flex-wrap items-end gap-4 relative">
            <div className="h-24 w-24 rounded-3xl glass-strong grid place-items-center text-4xl shadow-premium">
              🌐
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold font-display capitalize">
                {slug.replace(/-/g, " ")}
              </h1>
              <p className="text-sm text-muted-foreground">Community</p>
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" /> — members
                </span>
              </div>
            </div>
          </div>

          <div className="mt-10 glass rounded-2xl p-12 text-center text-muted-foreground">
            <Users className="h-10 w-10 mx-auto mb-4 opacity-40" />
            <p className="text-base font-medium">Community details coming soon</p>
            <p className="text-sm mt-2 opacity-60">
              This community page will show chat, notes, and members once the backend is available.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
