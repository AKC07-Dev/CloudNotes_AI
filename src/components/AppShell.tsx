import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  Bookmark,
  Command,
  Compass,
  Home,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Plus,
  Search,
  Settings as SettingsIcon,
  Shield,
  Sparkles,
  Upload,
  Users,
  User as UserIcon,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { CommandPalette } from "./CommandPalette";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AuroraBackground } from "./AuroraBackground";
import { useProfile } from "@/hooks/useProfile";
import { removeToken, isLoggedIn, isAdmin } from "@/lib/auth";

const FALLBACK_AVATAR = "https://ui-avatars.com/api/?background=6366F1&color=fff&name=User";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/feed", label: "Home Feed", icon: Home },
  { to: "/search", label: "Search", icon: Search },
  { to: "/communities", label: "Communities", icon: Users },
  { to: "/messages", label: "Messages", icon: MessageSquare },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/bookmarks", label: "Bookmarks", icon: Bookmark },
];

const secondary = [
  { to: "/profile", label: "Profile", icon: UserIcon },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { data: profile } = useProfile();
  const navigate = useNavigate();
  const admin = isAdmin();

  const userAvatar = profile?.profileImage ?? profile?.avatar ?? FALLBACK_AVATAR;
  const userName = profile?.fullName ?? "User";
  const userHandle = profile?.username ?? profile?.userId ?? "";

  // Redirect to /auth if not logged in
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate({ to: "/auth" });
    }
  }, [navigate]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleLogout = () => {
    removeToken();
    window.location.href = "/auth";
  };

  return (
    <div className="relative min-h-screen text-foreground">
      <AuroraBackground className="fixed inset-0 -z-10" />

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={`hidden md:flex flex-col shrink-0 sticky top-0 h-screen border-r border-white/5 bg-sidebar/60 backdrop-blur-xl transition-all duration-300 ${
            collapsed ? "w-[76px]" : "w-[248px]"
          }`}
        >
          <Link to="/" className="flex items-center gap-2 px-5 h-16 border-b border-white/5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary grid place-items-center shadow-glow">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="font-display font-bold leading-none">CloudNotes</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  AI
                </div>
              </div>
            )}
          </Link>

          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {!collapsed && (
              <p className="px-3 pb-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                Workspace
              </p>
            )}
            {nav.map((item) => {
              const active =
                path === item.to || (item.to !== "/dashboard" && path.startsWith(item.to));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition group ${
                    active
                      ? "bg-white/8 text-foreground shadow-glow"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  <item.icon className={`h-4 w-4 shrink-0 ${active ? "text-primary" : ""}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}

            <div className="pt-4">
              {!collapsed && (
                <p className="px-3 pb-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                  Account
                </p>
              )}
              {secondary.map((item) => {
                const active = path.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                      active
                        ? "bg-white/8 text-foreground"
                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                    }`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}

              {/* Admin link — only visible to the admin account */}
              {admin && (
                <Link
                  to="/admin"
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                    path.startsWith("/admin")
                      ? "bg-white/8 text-foreground"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  <Shield className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>Admin</span>}
                </Link>
              )}
            </div>
          </nav>

          <div className="p-3 border-t border-white/5">
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="w-full flex items-center gap-2 justify-center rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-white/5"
            >
              {collapsed ? (
                <ChevronsRight className="h-4 w-4" />
              ) : (
                <>
                  <ChevronsLeft className="h-4 w-4" /> Collapse
                </>
              )}
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Top bar */}
          <header className="sticky top-0 z-30 h-16 border-b border-white/5 bg-background/60 backdrop-blur-xl">
            <div className="h-full px-4 md:px-6 flex items-center gap-3">
              <button
                onClick={() => setPaletteOpen(true)}
                className="flex items-center gap-2 min-w-0 flex-1 max-w-xl h-10 rounded-xl glass px-3 text-sm text-muted-foreground hover:text-foreground transition"
              >
                <Search className="h-4 w-4 shrink-0" />
                <span className="truncate">Search notes, communities, people…</span>
                <span className="ml-auto hidden sm:flex items-center gap-1 text-[10px] text-muted-foreground">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 flex items-center gap-1">
                    <Command className="h-3 w-3" />K
                  </kbd>
                </span>
              </button>

              <div className="ml-auto flex items-center gap-1">
                <Link
                  to="/upload"
                  className="hidden sm:inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm font-medium hover:shadow-glow transition"
                >
                  <Plus className="h-4 w-4" /> Upload
                </Link>
                <Link
                  to="/notifications"
                  className="relative h-10 w-10 grid place-items-center rounded-xl hover:bg-white/5"
                >
                  <Bell className="h-4 w-4" />
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="h-10 pl-1 pr-2 flex items-center gap-2 rounded-xl hover:bg-white/5">
                      <img
                        src={userAvatar}
                        className="h-8 w-8 rounded-lg object-cover ring-1 ring-white/10"
                        alt="me"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = FALLBACK_AVATAR;
                        }}
                      />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 glass-strong">
                    <DropdownMenuLabel>
                      <div className="flex items-center gap-2">
                        <img
                          src={userAvatar}
                          className="h-8 w-8 rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = FALLBACK_AVATAR;
                          }}
                        />
                        <div>
                          <div className="text-sm font-medium">{userName}</div>
                          <div className="text-xs text-muted-foreground">@{userHandle}</div>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile">
                        <UserIcon className="h-4 w-4 mr-2" /> Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings">
                        <SettingsIcon className="h-4 w-4 mr-2" /> Settings
                      </Link>
                    </DropdownMenuItem>
                    {/* Admin link in dropdown — only for the admin account */}
                    {admin && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin">
                          <Shield className="h-4 w-4 mr-2" /> Admin
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" /> Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Mobile bottom nav */}
          <nav className="md:hidden fixed bottom-4 left-4 right-4 z-40 glass-strong rounded-2xl px-2 py-2 flex items-center justify-around shadow-premium">
            {[
              { to: "/feed", icon: Home },
              { to: "/search", icon: Compass },
              { to: "/upload", icon: Plus },
              { to: "/messages", icon: MessageSquare },
              { to: "/profile", icon: UserIcon },
            ].map((i) => (
              <Link
                key={i.to}
                to={i.to}
                className="h-11 w-11 grid place-items-center rounded-xl hover:bg-white/5"
              >
                <i.icon className="h-5 w-5" />
              </Link>
            ))}
          </nav>

          <main className="flex-1 pb-24 md:pb-0">{children}</main>
        </div>
      </div>

      {/* Floating action */}
      <Link
        to="/upload"
        className="md:hidden fixed bottom-24 right-6 z-40 h-14 w-14 grid place-items-center rounded-full bg-gradient-to-br from-primary to-secondary shadow-premium hover:shadow-glow"
      >
        <Upload className="h-5 w-5 text-white" />
      </Link>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}
