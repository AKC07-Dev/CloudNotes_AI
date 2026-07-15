import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuroraBackground } from "@/components/AuroraBackground";
import { Sparkles, Mail, Lock, Github, ArrowRight, Chrome } from "lucide-react";
import { toast } from "sonner";

import { api } from "@/lib/api";
import { saveToken, saveUser } from "@/lib/auth";

export const Route = createFileRoute("/auth")({ component: Auth });

function Auth() {
  const nav = useNavigate();

  const [mode, setMode] = useState<"signin" | "signup">("signin");

  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const generateUsername = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]/g, "") + Math.floor(Math.random() * 10000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (mode === "signup") {
        const signupRes = await api.signup({
          fullName,
          username: generateUsername(fullName),
          email,
          password,
        });

        const authData = signupRes.data as
          | { token?: string; user?: Parameters<typeof saveUser>[0] }
          | undefined;

        if (authData?.token && authData?.user) {
          saveToken(authData.token);
          saveUser(authData.user);
        } else {
          const loginRes = await api.login({ email, password });
          saveToken(loginRes.data.token);
          saveUser(loginRes.data.user);
        }

        toast.success("Account created successfully!");
        nav({ to: "/dashboard" });
        return;
      }

      const res = await api.login({
        email,
        password,
      });

      saveToken(res.data.token);
      saveUser(res.data.user);

      toast.success("Login successful!");

      nav({
        to: "/dashboard",
      });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen grid md:grid-cols-2">
      <AuroraBackground className="fixed inset-0 -z-10" />

      <div className="hidden md:flex flex-col justify-between p-10 border-r border-white/5">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary grid place-items-center shadow-glow">
            <Sparkles className="h-4 w-4 text-white" />
          </div>

          <span className="font-display font-bold">CloudNotes AI</span>
        </Link>

        <div>
          <h2 className="text-4xl font-bold font-display leading-tight">
            The <span className="text-gradient">smartest place</span> to study with your peers.
          </h2>

          <p className="text-muted-foreground mt-3 max-w-md">
            Join thousands of students sharing notes, communities and knowledge every day.
          </p>
        </div>

        <div className="text-xs text-muted-foreground">© 2026 CloudNotes AI</div>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md glass-strong rounded-3xl p-8 shadow-premium">
          <div className="flex gap-1 mb-6 glass rounded-xl p-1">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 h-9 rounded-lg text-sm font-medium ${
                  mode === m ? "bg-white/10 text-foreground" : "text-muted-foreground"
                }`}
              >
                {m === "signin" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <h1 className="text-2xl font-bold font-display">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>

          <p className="text-sm text-muted-foreground mt-1">
            {mode === "signin" ? "Sign in to continue." : "Create your CloudNotes account."}
          </p>

          <form className="mt-6 space-y-3" onSubmit={handleSubmit}>
            {mode === "signup" && (
              <Field
                label="Full Name"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            )}

            <Field
              label="Email"
              icon={Mail}
              type="email"
              placeholder="john@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Field
              label="Password"
              icon={Lock}
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              disabled={loading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground font-medium"
            >
              {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex-1 h-px bg-white/10" />
            OR CONTINUE WITH
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button className="h-10 rounded-xl glass">
              <Chrome className="inline h-4 w-4 mr-2" />
              Google
            </button>

            <button className="h-10 rounded-xl glass">
              <Github className="inline h-4 w-4 mr-2" />
              GitHub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
function Field({
  label,
  icon: Icon,
  ...props
}: {
  label: string;
  icon?: React.ElementType;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>

      <div className="mt-1 flex items-center gap-2 glass rounded-xl px-3 h-11">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}

        <input {...props} className="flex-1 bg-transparent outline-none text-sm" />
      </div>
    </label>
  );
}
