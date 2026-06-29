"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const CONFIG = {
  helper: {
    label: "Citizen",
    description: "Sign in to report civic issues",
    accent: "emerald",
    ring: "focus:border-emerald-500 focus:ring-emerald-500/20",
    btn: "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20",
    redirectTo: "/helper/home",
    allowSignUp: true,
  },
  worker: {
    label: "Field Worker",
    description: "Use credentials provided by your admin",
    accent: "amber",
    ring: "focus:border-amber-500 focus:ring-amber-500/20",
    btn: "bg-amber-600 hover:bg-amber-500 shadow-amber-500/20",
    redirectTo: "/worker/dashboard",
    allowSignUp: false,
  },
  admin: {
    label: "Administrator",
    description: "Restricted access — authorized personnel only",
    accent: "indigo",
    ring: "focus:border-indigo-500 focus:ring-indigo-500/20",
    btn: "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20",
    redirectTo: "/admin/dashboard",
    allowSignUp: false,
  },
};

const ROLE_HOME = {
  helper: "/helper/home",
  worker: "/worker/dashboard",
  admin: "/admin/dashboard",
};

export default function AuthPage({ role }) {
  const cfg = CONFIG[role];
  const { user, role: dbRole, loading, supabase } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && user && dbRole) {
      router.replace(ROLE_HOME[dbRole] || "/");
    }
  }, [loading, user, dbRole, router]);

  if (loading) return <Spinner />;
  if (user && dbRole) return <Spinner />;

  const handleLogin = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) throw authError;
      router.replace("/");
    } catch (e) {
      setError(e.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
        },
      });
      if (authError) throw authError;
      router.replace("/");
    } catch (e) {
      setError(e.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (authError) setError(authError.message);
  };

  const inputCls = `w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 ${cfg.ring}`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-6 flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-sm font-black text-white">
              CS
            </div>
            <h1 className="text-xl font-bold text-gray-900">{cfg.label}</h1>
            <p className="mt-1 text-sm text-gray-500">{cfg.description}</p>
          </div>

          {cfg.allowSignUp && (
            <div className="mb-5 flex rounded-xl border border-gray-200 bg-gray-100 p-1">
              {["login", "signup"].map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTab(t);
                    setError("");
                  }}
                  className={`flex-1 rounded-lg py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                    tab === t
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {t === "login" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {tab === "login" || !cfg.allowSignUp ? (
            <>
              <button
                onClick={handleGoogle}
                type="button"
                className="mb-4 flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 cursor-pointer"
              >
                <GoogleIcon />
                Continue with Google
              </button>
              <Divider />
              <form onSubmit={handleLogin} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className={inputCls}
                  required
                />
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className={inputCls}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPw ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <SubmitBtn busy={busy} cls={cfg.btn}>
                  Sign In
                </SubmitBtn>
              </form>
            </>
          ) : (
            <>
              <button
                onClick={handleGoogle}
                type="button"
                className="mb-4 flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 cursor-pointer"
              >
                <GoogleIcon />
                Continue with Google
              </button>
              <Divider />
              <form onSubmit={handleSignUp} className="space-y-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className={inputCls}
                  required
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className={inputCls}
                  required
                />
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className={inputCls}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPw ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <SubmitBtn busy={busy} cls={cfg.btn}>
                  Create Account
                </SubmitBtn>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SubmitBtn({ busy, cls, children }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all disabled:opacity-50 cursor-pointer ${cls}`}
    >
      {busy && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

function Divider() {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="h-px flex-1 bg-gray-200" />
      <span className="text-xs text-gray-400">or</span>
      <div className="h-px flex-1 bg-gray-200" />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function Spinner() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-800" />
    </div>
  );
}
