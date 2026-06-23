"use client";
// src/app/login/page.tsx
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

const FLOATING_ORBS = [
  { size: 560, top: -180, left: -140, color: "rgba(37,99,235,0.13)", blur: 160 },
  { size: 480, bottom: -160, right: -100, color: "rgba(124,58,237,0.15)", blur: 150 },
  { size: 320, top: "38%", left: "48%", color: "rgba(99,102,241,0.07)", blur: 110, transform: "translate(-50%,-50%)" },
];

const STATS = [
  { value: "50K+", label: "Connections sent" },
  { value: "4.2×", label: "Reply rate increase" },
  { value: "98%", label: "Deliverability" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      setError("Incorrect email or password. Please try again.");
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
    <div style={{
      position: "fixed", inset: 0, overflowY: "auto",
      background: "#04071a",
      color: "white",
      fontFamily: "'Inter', 'Plus Jakarta Sans', system-ui, sans-serif",
    }}>

      {/* ── Ambient background ── */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {FLOATING_ORBS.map((orb, i) => (
          <div key={i} style={{
            position: "absolute",
            width: orb.size, height: orb.size,
            borderRadius: "50%",
            background: orb.color,
            filter: `blur(${orb.blur}px)`,
            top: orb.top as number | undefined,
            left: orb.left as number | undefined,
            bottom: (orb as { bottom?: number }).bottom,
            right: (orb as { right?: number }).right,
            transform: (orb as { transform?: string }).transform,
          }} />
        ))}
        {/* Fine grid */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)
          `,
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, black 30%, transparent 100%)",
        }} />
        {/* Top edge shimmer */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.4), transparent)",
        }} />
      </div>

      {/* ── Page layout ── */}
      <div style={{
        position: "relative", zIndex: 1,
        minHeight: "100%", display: "flex",
        opacity: mounted ? 1 : 0,
        transition: "opacity 0.4s ease",
      }}>

        {/* ── Left panel (desktop only) ── */}
        <div style={{
          display: "none",
          flex: "0 0 420px",
          borderRight: "1px solid rgba(255,255,255,0.05)",
          background: "rgba(255,255,255,0.015)",
          padding: "60px 48px",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
          className="auth-left-panel"
        >
          {/* Brand mark */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 64 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 24px rgba(139,92,246,0.4)",
              }}>
                <span style={{ color: "white", fontSize: 14, fontWeight: 800, letterSpacing: -0.5 }}>LC</span>
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.9)", letterSpacing: -0.3 }}>Lin-C</span>
            </div>

            <h2 style={{
              fontSize: 32, fontWeight: 800, lineHeight: 1.2,
              background: "linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.65) 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              margin: "0 0 16px",
            }}>
              Turn LinkedIn into your best sales channel.
            </h2>
            <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
              Automate outreach, personalise at scale, and book more meetings — without the manual grind.
            </p>
          </div>

          {/* Stats */}
          <div>
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
              gap: 1,
              borderRadius: 16,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.07)",
              background: "rgba(255,255,255,0.04)",
              marginBottom: 40,
            }}>
              {STATS.map((s) => (
                <div key={s.label} style={{ padding: "20px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#a78bfa", marginBottom: 4 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.04em" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Trust signal */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e" }} />
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", letterSpacing: "0.03em" }}>
                AI-powered LinkedIn outreach platform
              </span>
            </div>
          </div>
        </div>

        {/* ── Right panel / main form ── */}
        <div style={{
          flex: 1,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "60px 24px",
        }}>
          <div style={{ width: "100%", maxWidth: 400 }}>

            {/* Mobile brand */}
            <div style={{ textAlign: "center", marginBottom: 40 }} className="auth-mobile-brand">
              <div style={{
                width: 52, height: 52, borderRadius: 15,
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 40px rgba(139,92,246,0.45)",
                marginBottom: 16,
              }}>
                <span style={{ color: "white", fontSize: 18, fontWeight: 800 }}>LC</span>
              </div>
              <h1 style={{
                fontSize: 22, fontWeight: 800, margin: "0 0 6px",
                background: "linear-gradient(to right, #fff, #c4b5fd)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                LinkedIn-Connector
              </h1>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", margin: 0 }}>
                AI-powered outreach, on autopilot.
              </p>
            </div>

            {/* Heading */}
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 6px", letterSpacing: -0.5 }}>Welcome back</h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", margin: 0 }}>Sign in to your account to continue.</p>
            </div>

            {/* Google */}
            <GoogleButton loading={googleLoading} onClick={handleGoogle} label="Continue with Google" />

            {/* Divider */}
            <Divider label="or continue with email" />

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <InputField
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@company.com"
                icon={<Mail size={15} color="rgba(255,255,255,0.3)" />}
                autoComplete="email"
              />

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <label style={labelStyle}>Password</label>
                  <button
                    type="button"
                    style={{ fontSize: 12, color: "#a78bfa", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                  >
                    Forgot password?
                  </button>
                </div>
                <InputField
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={setPassword}
                  placeholder="Enter your password"
                  icon={<Lock size={15} color="rgba(255,255,255,0.3)" />}
                  suffix={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", display: "flex", padding: 0, lineHeight: 1 }}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  }
                  autoComplete="current-password"
                  noLabel
                />
              </div>

              {error && <ErrorBox message={error} />}

              <SubmitButton loading={loading} label="Sign In" />
            </form>

            <p style={{ textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 28, marginBottom: 0 }}>
              Don&apos;t have an account?{" "}
              <Link href="/signup" style={{ color: "#a78bfa", fontWeight: 600, textDecoration: "none" }}>
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .auth-mobile-brand { display: block; }
        .auth-left-panel { display: none !important; }
        @media (min-width: 860px) {
          .auth-mobile-brand { display: none !important; }
          .auth-left-panel { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

/* ─── Shared sub-components ─── */

const labelStyle: React.CSSProperties = {
  fontSize: 12, color: "rgba(255,255,255,0.45)",
  letterSpacing: "0.04em", fontWeight: 500,
};

function InputField({
  label, type = "text", value, onChange, placeholder, icon, suffix, autoComplete, noLabel,
}: {
  label?: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
  icon?: React.ReactNode; suffix?: React.ReactNode;
  autoComplete?: string; noLabel?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      {label && !noLabel && <label style={{ ...labelStyle, display: "block", marginBottom: 8 }}>{label}</label>}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        height: 48, borderRadius: 12, padding: "0 14px",
        border: `1px solid ${focused ? "rgba(139,92,246,0.55)" : "rgba(255,255,255,0.08)"}`,
        background: focused ? "rgba(139,92,246,0.06)" : "rgba(255,255,255,0.03)",
        transition: "border-color 0.2s, background 0.2s",
        boxShadow: focused ? "0 0 0 3px rgba(139,92,246,0.1)" : "none",
      }}>
        {icon}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1, background: "transparent", border: "none", outline: "none",
            color: "white", fontSize: 14,
          }}
        />
        {suffix}
      </div>
    </div>
  );
}

function GoogleButton({ loading, onClick, label }: { loading: boolean; onClick: () => void; label: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%", height: 48, borderRadius: 12,
        border: `1px solid ${hovered ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.09)"}`,
        background: hovered ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.04)",
        color: "white", fontWeight: 600, fontSize: 14,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        cursor: loading ? "wait" : "pointer",
        transition: "all 0.18s",
        marginBottom: 24,
      }}
    >
      {loading ? (
        <Spinner />
      ) : (
        <>
          <GoogleIcon />
          {label}
        </>
      )}
    </button>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
      <div style={{ position: "absolute", width: "100%", height: 1, background: "rgba(255,255,255,0.07)" }} />
      <span style={{
        position: "relative", background: "#04071a", padding: "0 14px",
        fontSize: 11, color: "rgba(255,255,255,0.25)",
        letterSpacing: "0.12em", textTransform: "uppercase",
      }}>{label}</span>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div style={{
      background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)",
      color: "#fca5a5", borderRadius: 10, padding: "11px 14px", fontSize: 13, lineHeight: 1.5,
    }}>
      {message}
    </div>
  );
}

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="submit"
      disabled={loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%", height: 48, borderRadius: 12, border: "none",
        background: hovered && !loading
          ? "linear-gradient(135deg, #3b6fe8, #9333ea)"
          : "linear-gradient(135deg, #2563eb, #7c3aed)",
        color: "white", fontWeight: 700, fontSize: 15,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        cursor: loading ? "not-allowed" : "pointer",
        boxShadow: hovered && !loading
          ? "0 8px 28px rgba(99,102,241,0.45)"
          : "0 4px 16px rgba(99,102,241,0.25)",
        transform: hovered && !loading ? "translateY(-1px)" : "none",
        transition: "all 0.18s",
        opacity: loading ? 0.8 : 1,
        marginTop: 4,
      }}
    >
      {loading ? <Spinner /> : <>{label} <ArrowRight size={16} /></>}
    </button>
  );
}

function Spinner() {
  return (
    <div style={{
      width: 18, height: 18,
      border: "2px solid rgba(255,255,255,0.25)",
      borderTopColor: "white", borderRadius: "50%",
      animation: "spin 0.75s linear infinite",
    }} />
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}