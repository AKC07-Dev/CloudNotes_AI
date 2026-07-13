import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { useState, useEffect, useRef } from "react";
import { Bell, Lock, Palette, Puzzle, User } from "lucide-react";
import { toast } from "sonner";
import { useProfile, useUpdateProfile, useUploadProfileImage } from "@/hooks/useProfile";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

const sections = [
  { id: "account", label: "Account", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Lock },
  { id: "integrations", label: "Integrations", icon: Puzzle },
];

const FALLBACK_AVATAR = "https://ui-avatars.com/api/?background=6366F1&color=fff&name=User";

function SettingsPage() {
  const [tab, setTab] = useState("account");
  const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadProfileImage = useUploadProfileImage();

  // Controlled fields for the account section
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  const [bio, setBio] = useState("");

  // Pre-fill when profile loads
  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName ?? "");
      setDepartment(profile.department ?? "");
      setSemester(profile.semester?.toString() ?? "");
      setBio(profile.bio ?? "");
    }
  }, [profile]);

  const handleSave = () => {
    if (tab === "account") {
      updateProfile.mutate({
        fullName: fullName || undefined,
        bio: bio || undefined,
        department: department || undefined,
        semester: semester ? parseInt(semester, 10) : undefined,
      });
    } else {
      toast.success("Saved!");
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("Please select a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 1024 * 1024) {
      toast.error("Image must be under 1 MB.");
      return;
    }
    uploadProfileImage.mutate(file);
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  return (
    <AppShell>
      <div className="p-6 md:p-10 max-w-6xl mx-auto animate-fade-up">
        <PageHeader
          eyebrow="Preferences"
          title="Settings"
          description="Personalize CloudNotes to fit exactly how you work."
        />

        {/* Hidden file input for avatar */}
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleAvatarChange}
        />

        <div className="grid md:grid-cols-[220px_1fr] gap-6">
          <nav className="glass rounded-2xl p-2 h-max sticky top-24">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setTab(s.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                  tab === s.id ? "bg-white/10" : "text-muted-foreground hover:bg-white/5"
                }`}
              >
                <s.icon className="h-4 w-4" /> {s.label}
              </button>
            ))}
          </nav>

          <div className="space-y-6">
            {tab === "account" && (
              <>
                <Panel title="Profile" desc="How others see you on CloudNotes.">
                  <div className="flex items-center gap-4">
                    <img
                      src={profile?.avatar ?? FALLBACK_AVATAR}
                      className="h-16 w-16 rounded-xl object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = FALLBACK_AVATAR;
                      }}
                    />
                    <div>
                      <button
                        className="h-9 px-3 rounded-lg glass hover:bg-white/10 text-sm disabled:opacity-60"
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={uploadProfileImage.isPending}
                      >
                        {uploadProfileImage.isPending ? "Uploading…" : "Change avatar"}
                      </button>
                      <p className="text-xs text-muted-foreground mt-2">
                        JPG, PNG or WebP. 1MB max.
                      </p>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3 mt-4">
                    <Text
                      label="Full name"
                      value={fullName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFullName(e.target.value)
                      }
                    />
                    <Text
                      label="Handle"
                      defaultValue={profile?.username ?? profile?.userId ?? ""}
                      readOnly
                    />
                    <Text
                      label="Department"
                      value={department}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setDepartment(e.target.value)
                      }
                    />
                    <Text
                      label="Semester"
                      value={semester}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSemester(e.target.value)
                      }
                    />
                  </div>
                  <TextArea
                    label="Bio"
                    value={bio}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value)}
                  />
                </Panel>
                <Panel title="Danger zone" desc="Irreversible account actions.">
                  <button className="h-9 px-3 rounded-lg bg-danger/20 text-danger text-sm">
                    Delete account
                  </button>
                </Panel>
              </>
            )}

            {tab === "appearance" && (
              <Panel title="Theme" desc="Dark, light, or system.">
                <div className="grid sm:grid-cols-3 gap-3">
                  {(["dark", "light", "system"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`rounded-2xl p-4 border transition text-left ${
                        theme === t
                          ? "border-primary bg-primary/10 shadow-glow"
                          : "border-white/5 hover:bg-white/5"
                      }`}
                    >
                      <div
                        className={`h-16 rounded-lg mb-3 ${
                          t === "dark"
                            ? "bg-neutral-950"
                            : t === "light"
                              ? "bg-neutral-100"
                              : "bg-gradient-to-r from-neutral-950 to-neutral-100"
                        }`}
                      />
                      <div className="text-sm capitalize">{t}</div>
                    </button>
                  ))}
                </div>
              </Panel>
            )}

            {tab === "notifications" && (
              <Panel title="Notifications" desc="Choose what you want to hear about.">
                {[
                  "Comments on my notes",
                  "New followers",
                  "Mentions",
                  "Community activity",
                  "Weekly digest",
                ].map((l) => (
                  <Toggle key={l} label={l} defaultOn={l !== "Weekly digest"} />
                ))}
              </Panel>
            )}

            {tab === "security" && (
              <Panel title="Security" desc="Keep your account safe.">
                <Text label="Current password" type="password" />
                <Text label="New password" type="password" />
                <Toggle label="Two-factor authentication" defaultOn />
                <Toggle label="Alert me on new sign-in" defaultOn />
              </Panel>
            )}

            {tab === "integrations" && (
              <Panel title="Integrations" desc="Connect your workflow.">
                {[
                  { n: "Google Drive", d: "Sync notes automatically" },
                  { n: "Notion", d: "Export notes to your workspace" },
                  { n: "Slack", d: "Get notifications in Slack" },
                ].map((i) => (
                  <div
                    key={i.n}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5"
                  >
                    <div>
                      <div className="text-sm font-medium">{i.n}</div>
                      <div className="text-xs text-muted-foreground">{i.d}</div>
                    </div>
                    <button className="h-8 px-3 rounded-lg bg-white/10 text-xs">Connect</button>
                  </div>
                ))}
              </Panel>
            )}

            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={updateProfile.isPending}
                className="h-10 px-5 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm font-medium hover:shadow-glow disabled:opacity-60"
              >
                {updateProfile.isPending ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Panel({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="mb-4">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Text({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <input
        {...props}
        className="mt-1 w-full glass rounded-xl px-3 h-10 text-sm bg-transparent outline-none focus:shadow-glow"
      />
    </label>
  );
}

function TextArea({
  label,
  ...props
}: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block mt-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <textarea
        {...props}
        rows={3}
        className="mt-1 w-full glass rounded-xl px-3 py-2 text-sm bg-transparent outline-none focus:shadow-glow"
      />
    </label>
  );
}

function Toggle({ label, defaultOn }: { label: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(!!defaultOn);
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm">{label}</span>
      <button
        onClick={() => setOn(!on)}
        className={`h-6 w-11 rounded-full transition ${
          on ? "bg-gradient-to-r from-primary to-secondary" : "bg-white/10"
        } relative`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
            on ? "left-5" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}
