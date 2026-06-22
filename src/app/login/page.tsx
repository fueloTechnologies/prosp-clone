"use client";
// src/app/login/page.tsx
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, Sparkles, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("demo@prosp.ai");
  const [password, setPassword] = useState("demo123");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (result?.error) {
      setError("Invalid credentials. Try demo@prosp.ai / demo123");
      setLoading(false);
    } else {
      router.push("/sequences");
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: "/sequences" });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflowY: "auto",
        background: "#050816",
        color: "white",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* Background glows — fixed so they don't scroll */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: -200, left: -120, width: 500, height: 500, borderRadius: "50%", background: "rgba(37,99,235,0.18)", filter: "blur(140px)" }} />
        <div style={{ position: "absolute", bottom: -200, right: -120, width: 500, height: 500, borderRadius: "50%", background: "rgba(124,58,237,0.18)", filter: "blur(140px)" }} />
        <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)", width: 700, height: 400, background: "rgba(59,130,246,0.06)", filter: "blur(120px)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>

      {/* Scrollable content */}
      <div style={{ position: "relative", zIndex: 1, minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
        <div style={{ width: "100%", maxWidth: 440 }}>

          {/* ── Logo ── */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 40 }}>
            <div style={{ position: "relative", width: 80, height: 80, borderRadius: 24, background: "linear-gradient(135deg,#3b82f6,#8b5cf6,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 60px rgba(139,92,246,0.5), 0 20px 40px rgba(0,0,0,0.4)" }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: 24, background: "rgba(255,255,255,0.12)" }} />
              <span style={{ position: "relative", zIndex: 1, color: "white", fontSize: 28, fontWeight: 900, letterSpacing: -1 }}>LC</span>
            </div>

            <h1 style={{ marginTop: 20, marginBottom: 0, fontSize: 30, fontWeight: 900, background: "linear-gradient(to right,#ffffff,#bfdbfe,#c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: -0.5, textAlign: "center" }}>
              LinkedIn-Connector
            </h1>

            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 10px #22c55e" }} />
              <span style={{ color: "#6b7280", fontSize: 13, letterSpacing: "0.02em" }}>AI Powered LinkedIn Outreach</span>
            </div>
          </div>

          {/* ── Card ── */}
          <div style={{ borderRadius: 32, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(7,13,31,0.7)", backdropFilter: "blur(32px)", padding: 36, boxShadow: "0 0 100px rgba(59,130,246,0.08), inset 0 1px 0 rgba(255,255,255,0.06)" }}>

            {/* Header */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <Sparkles size={18} color="#a78bfa" />
                <h2 style={{ fontSize: 24, fontWeight: 800, color: "white", margin: 0, letterSpacing: -0.3 }}>Welcome back</h2>
              </div>
              <p style={{ color: "#6b7280", fontSize: 14, margin: 0 }}>Sign in to continue scaling your outreach.</p>
            </div>

            {/* Google Button */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleLoading}
              style={{ width: "100%", height: 50, borderRadius: 16, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "white", fontWeight: 600, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, cursor: "pointer", marginBottom: 24, transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
            >
              {googleLoading ? (
                <div style={{ width: 20, height: 20, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            {/* Divider */}
            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
              <div style={{ position: "absolute", width: "100%", height: 1, background: "rgba(255,255,255,0.08)" }} />
              <span style={{ position: "relative", background: "#070d1f", padding: "0 14px", fontSize: 11, color: "#4b5563", letterSpacing: "0.15em", textTransform: "uppercase" as const }}>or sign in with email</span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              {/* Email */}
              <div>
                <label style={{ display: "block", fontSize: 12, color: "#9ca3af", marginBottom: 8, letterSpacing: "0.05em" }}>Email Address</label>
                <div
                  style={{ display: "flex", alignItems: "center", gap: 12, borderRadius: 14, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", padding: "0 16px", height: 50 }}
                  onFocusCapture={e => (e.currentTarget.style.borderColor = "rgba(59,130,246,0.5)")}
                  onBlurCapture={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                >
                  <Mail size={16} color="#6b7280" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    style={{ background: "transparent", border: "none", outline: "none", width: "100%", color: "white", fontSize: 14 }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <label style={{ fontSize: 12, color: "#9ca3af", letterSpacing: "0.05em" }}>Password</label>
                  <button type="button" style={{ fontSize: 12, color: "#a78bfa", background: "none", border: "none", cursor: "pointer" }}>Forgot password?</button>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: 12, borderRadius: 14, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", padding: "0 16px", height: 50 }}
                  onFocusCapture={e => (e.currentTarget.style.borderColor = "rgba(139,92,246,0.5)")}
                  onBlurCapture={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                >
                  <Lock size={16} color="#6b7280" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ background: "transparent", border: "none", outline: "none", width: "100%", color: "white", fontSize: 14 }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", display: "flex", padding: 0 }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5", borderRadius: 12, padding: "12px 16px", fontSize: 13 }}>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{ width: "100%", height: 50, borderRadius: 14, background: "linear-gradient(to right,#2563eb,#7c3aed)", border: "none", color: "white", fontWeight: 700, fontSize: 16, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 8px 32px rgba(37,99,235,0.3)", transition: "all 0.2s", marginTop: 4, opacity: loading ? 0.8 : 1 }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = "scale(1.02)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
              >
                {loading ? (
                  <div style={{ width: 20, height: 20, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                ) : (
                  <>Sign In <ArrowRight size={18} /></>
                )}
              </button>
            </form>

            {/* Demo hint */}
            <div style={{ marginTop: 20, padding: "10px 16px", borderRadius: 12, background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.12)", textAlign: "center" }}>
              <span style={{ fontSize: 12, color: "#6b7280" }}>Demo: </span>
              <span style={{ fontSize: 12, color: "#60a5fa", fontWeight: 600 }}>demo@prosp.ai</span>
              <span style={{ fontSize: 12, color: "#6b7280" }}> / </span>
              <span style={{ fontSize: 12, color: "#60a5fa", fontWeight: 600 }}>demo123</span>
            </div>

            {/* Signup link */}
            <p style={{ textAlign: "center", color: "#6b7280", fontSize: 14, marginTop: 20, marginBottom: 0 }}>
              Don&apos;t have an account?{" "}
              <Link href="/signup" style={{ color: "#a78bfa", fontWeight: 600, textDecoration: "none" }}>Create account</Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}