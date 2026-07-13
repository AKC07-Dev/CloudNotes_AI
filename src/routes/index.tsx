import { createFileRoute, Link } from "@tanstack/react-router";
import { AuroraBackground } from "@/components/AuroraBackground";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Cloud,
  Command,
  Search,
  Sparkles,
  Users,
  Zap,
  Github,
  Twitter,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { usePublicNotes } from "@/hooks/useNotes";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const { data: publicNotes = [] } = usePublicNotes();

  // Use real notes for preview; fall back to placeholder cards if not yet loaded
  const previewNotes = publicNotes.slice(0, 3);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AuroraBackground className="fixed inset-0 -z-10" />

      {/* Nav */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/60 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary grid place-items-center shadow-glow">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-display font-bold">
              CloudNotes<span className="text-muted-foreground"> AI</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground">
              Features
            </a>
            <a href="#community" className="hover:text-foreground">
              Community
            </a>
            <a href="#pricing" className="hover:text-foreground">
              Pricing
            </a>
            <Link to="/dashboard" className="hover:text-foreground">
              Dashboard
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/auth"
              className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground px-3"
            >
              Sign in
            </Link>
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm font-medium hover:shadow-glow transition"
            >
              Get started <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative px-6 pt-20 pb-24">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1 text-xs mb-6 animate-fade-up">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            New — AI-powered study assistant is here
          </div>
          <h1 className="text-5xl md:text-7xl font-bold font-display leading-[1.05] animate-fade-up">
            Where students <span className="text-gradient">learn together</span>.
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground animate-fade-up">
            CloudNotes AI is the modern home for your class notes. Upload PDFs, discover the best
            resources by subject, and study alongside thousands of students in live communities.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 animate-fade-up">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground font-medium hover:shadow-glow transition"
            >
              Start for free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/feed"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-xl glass hover:bg-white/10 transition"
            >
              <Command className="h-4 w-4" /> Explore the feed
            </Link>
          </div>

          {/* Search hero */}
          <div className="mt-14 max-w-2xl mx-auto glass-strong rounded-2xl p-2 flex items-center gap-2 shadow-premium animate-fade-up">
            <div className="pl-3 pr-2 text-muted-foreground">
              <Search className="h-4 w-4" />
            </div>
            <input
              readOnly
              placeholder='Try: "Fourier transforms cheatsheet"'
              className="flex-1 bg-transparent outline-none py-3 text-sm placeholder:text-muted-foreground"
            />
            <button className="h-10 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-sm">
              Search
            </button>
          </div>

          {/* Stats — marketing copy, intentionally static */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { label: "Students", value: 128420 },
              { label: "Notes shared", value: 84120 },
              { label: "Communities", value: 1204 },
              { label: "Downloads", value: 2410000 },
            ].map((s) => (
              <div key={s.label} className="glass rounded-2xl p-5">
                <div className="text-3xl font-bold font-display">
                  <AnimatedCounter value={s.value} />
                </div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preview — real notes from backend, or placeholder cards */}
      <section className="relative px-6 pb-24">
        <div className="max-w-6xl mx-auto glass-strong rounded-3xl p-2 shadow-premium gradient-border">
          <div className="rounded-[22px] bg-background/70 p-6 grid md:grid-cols-3 gap-4">
            {previewNotes.length > 0
              ? previewNotes.map((n) => (
                  <div key={n.noteId} className="rounded-2xl overflow-hidden glass">
                    <div className="aspect-[4/3] bg-gradient-to-br from-primary/40 to-secondary/40 grid place-items-center">
                      <FileText className="h-10 w-10 opacity-60" />
                    </div>
                    <div className="p-4">
                      <div className="text-xs text-muted-foreground">
                        {n.subject} · {n.department}
                      </div>
                      <div className="font-semibold mt-1 line-clamp-1">{n.title}</div>
                    </div>
                  </div>
                ))
              : // Skeleton placeholders while loading
                [0, 1, 2].map((i) => (
                  <div key={i} className="rounded-2xl overflow-hidden glass animate-pulse">
                    <div className="aspect-[4/3] bg-white/5" />
                    <div className="p-4">
                      <div className="h-3 w-24 rounded bg-white/10 mb-2" />
                      <div className="h-4 w-40 rounded bg-white/10" />
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs uppercase tracking-[0.2em] text-secondary">
              Built for how you actually study
            </p>
            <h2 className="text-4xl md:text-5xl font-bold font-display mt-3">
              Everything you need to master your semester.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                icon: Cloud,
                title: "Cloud-first library",
                desc: "All your notes in one place, accessible from any device with instant preview.",
              },
              {
                icon: Zap,
                title: "AI-powered discovery",
                desc: "Search across millions of pages and get instant summaries and study plans.",
              },
              {
                icon: Users,
                title: "Live communities",
                desc: "Join study groups by course. Chat, share, and grow together in real time.",
              },
              {
                icon: ShieldCheck,
                title: "Verified authors",
                desc: "Notes reviewed and rated by peers. Trust badges from top contributors.",
              },
              {
                icon: BookOpen,
                title: "Rich PDF viewer",
                desc: "Annotate, highlight, and bookmark pages. Sync progress across devices.",
              },
              {
                icon: BadgeCheck,
                title: "Contribution score",
                desc: "Track your impact, earn achievements, and climb your department leaderboard.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="glass rounded-2xl p-6 hover:shadow-premium hover:-translate-y-1 transition"
              >
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/30 to-secondary/30 grid place-items-center mb-4">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-lg">{f.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto glass-strong rounded-3xl p-12 text-center gradient-border relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{ background: "radial-gradient(circle at 50% 0%, #6366F1, transparent 60%)" }}
          />
          <h2 className="text-4xl md:text-5xl font-bold font-display relative">
            Join <span className="text-gradient">students worldwide</span>
          </h2>
          <p className="text-muted-foreground mt-3 relative">
            Sign up in 30 seconds. It&apos;s free forever for students.
          </p>
          <div className="mt-8 relative">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 h-12 px-8 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground font-medium hover:shadow-glow transition"
            >
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-4 justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-primary to-secondary" />© 2026
            CloudNotes AI
          </div>
        </div>
      </footer>
    </div>
  );
}
