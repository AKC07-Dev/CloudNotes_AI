import type { LucideIcon } from "lucide-react";
import { AnimatedCounter } from "./AnimatedCounter";

export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  accent = "primary",
}: {
  label: string;
  value: number;
  delta?: string;
  icon: LucideIcon;
  accent?: "primary" | "secondary" | "success" | "warning" | "danger";
}) {
  const accentBg: Record<string, string> = {
    primary: "from-primary/30 to-primary/0",
    secondary: "from-secondary/30 to-secondary/0",
    success: "from-success/30 to-success/0",
    warning: "from-warning/30 to-warning/0",
    danger: "from-danger/30 to-danger/0",
  };
  return (
    <div className="glass rounded-2xl p-5 relative overflow-hidden group hover:shadow-premium transition">
      <div
        className={`absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br ${accentBg[accent]} blur-2xl`}
      />
      <div className="flex items-center justify-between relative">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <div className="h-9 w-9 grid place-items-center rounded-xl glass-strong">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 flex items-end gap-2">
        <div className="text-3xl font-bold font-display">
  {value}
</div>
        {delta && <span className="text-xs text-success mb-1.5">{delta}</span>}
      </div>
    </div>
  );
}
