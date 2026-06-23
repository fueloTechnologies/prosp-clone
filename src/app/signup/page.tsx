"use client";
// src/app/signup/page.tsx
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Check } from "lucide-react";
import Link from "next/link";

const PERKS = [
  "Unlimited LinkedIn sequences",
  "AI-powered message personalisation",
  "Real-time reply detection",
  "Analytics & A/B testing",
];

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const strength = !password ? 0
    : password.length < 4 ? 1
    : password.length < 7 ? 2
    : password.length < 10 ? 3 : 4;

  const strengthMeta = [
    { label: "", color: "transparent" },
    { label: "Too short", color: "#ef4444" },
    { label: "Weak", color: "#eab308" },
    { label: "Good", color: "#3b82f6" },
    { label: "Strong", color: "#22c55e" },
  ][strength];

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Please enter your full name."); return; }
    if (!email.trim()) { setError("Please enter your email address."); return; }
    if (!password) { setError("Please choose a password."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    try {
      setLoading(true);
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Signup failed. Please try again."); return; }
      router.push("/login?registered=1");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const handleGoogle = async () => {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: "/sequences" });
  };

  return (
    <div style={{
      position: "fixed", inset: 0, overflowY: "auto",
      background: "#04071a", color: "white",
      fontFamily: "'Inter', 'Plus Jakarta Sans', system-ui, sans-serif",
    }}>

      {/* ── Ambient background ── */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: -200, right: -100, width: 520, height: 520, borderRadius: "50%", background: "rgba(124,58,237,0.14)", filter: "blur(150px)" }} />
        <div style={{ position: "absolute", bottom: -160, left: -120, width: 480, height: 480, borderRadius: "50%", background: "rgba(37,99,235,0.12)", filter: "blur(140px)" }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 320, borderRadius: "50%", background: "rgba(99,102,241,0.05)", filter: "blur(100px)" }} />
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)
          `,
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, black 30%, transparent 100%)",
        }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.4), transparent)" }} />
      </div>

      {/* ── Page layout ── */}
      <div style={{
        position: "relative", zIndex: 1, minHeight: "100%",
        display: "flex",
        opacity: mounted ? 1 : 0, transition: "opacity 0.4s ease",
      }}>

        {/* ── Left panel ── */}
        <div style={{
          display: "none",
          flex: "0 0 400px",
          borderRight: "1px solid rgba(255,255,255,0.05)",
          background: "rgba(255,255,255,0.015)",
          padding: "60px 44px",
          flexDirection: "column",
          justifyContent: "space-between",
        }} className="auth-left-panel">

          <div>
            {/* Brand */}
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
              fontSize: 28, fontWeight: 800, lineHeight: 1.25, margin: "0 0 14px",
              background: "linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.6) 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              Everything you need to scale outreach.
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", lineHeight: 1.7, margin: "0 0 40px" }}>
              Join thousands of sales teams automating LinkedIn prospecting with Lin-C.
            </p>

            {/* Perks list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {PERKS.map(perk => (
                <div key={perk} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                    background: "rgba(139,92,246,0.15)",
                    border: "1px solid rgba(139,92,246,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Check size={12} color="#a78bfa" strokeWidth={2.5} />
                  </div>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>{perk}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer note */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e" }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.28)" }}>Free to start. No credit card required.</span>
          </div>
        </div>

        {/* ── Right panel / form ── */}
        <div style={{
          flex: 1,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "60px 24px",
        }}>
          <div style={{ width: "100%", maxWidth: 400 }}>

            {/* Mobile brand */}
            <div style={{ textAlign: "center", marginBottom: 36 }} className="auth-mobile-brand">
              <div style={{
                width: 50, height: 50, borderRadius: 14,
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 36px rgba(139,92,246,0.4)",
                marginBottom: 14,
              }}>
                <span style={{ color: "white", fontSize: 17, fontWeight: 800 }}>LC</span>
              </div>
              <h1 style={{
                fontSize: 20, fontWeight: 800, margin: "0 0 4px",
                background: "linear-gradient(to right, #fff, #c4b5fd)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>LinkedIn-Connector</h1>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.32)", margin: 0 }}>Free to start · No credit card needed</p>
            </div>

            {/* Heading */}
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 6px", letterSpacing: -0.4 }}>Create your account</h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.38)", margin: 0 }}>Get started for free in under a minute.</p>
            </div>

            {/* Google */}
            <GoogleButton loading={googleLoading} onClick={handleGoogle} label="Sign up with Google" />

            {/* Divider */}
            <Divider label="or sign up with email" />

            {/* Form */}
            <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              <InputField
                label="Full Name"
                value={name}
                onChange={setName}
                placeholder="Jane Smith"
                icon={<User size={15} color="rgba(255,255,255,0.3)" />}
                autoComplete="name"
              />

              <InputField
                label="Email Address"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="jane@company.com"
                icon={<Mail size={15} color="rgba(255,255,255,0.3)" />}
                autoComplete="email"
              />

              <div>
                <label style={{ ...labelStyle, display: "block", marginBottom: 8 }}>Password</label>
                <InputField
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={setPassword}
                  placeholder="Min. 6 characters"
                  icon={<Lock size={15} color="rgba(255,255,255,0.3)" />}
                  suffix={
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", display: "flex", padding: 0 }}>
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  }
                  autoComplete="new-password"
                  noLabel
                />
                {password && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ display: "flex", gap: 5, marginBottom: 5 }}>
                      {[1, 2, 3, 4].map(lvl => (
                        <div key={lvl} style={{
                          flex: 1, height: 2, borderRadius: 99,
                          background: lvl <= strength ? strengthMeta.color : "rgba(255,255,255,0.08)",
                          transition: "background 0.25s",
                        }} />
                      ))}
                    </div>
                    <span style={{ fontSize: 11, color: strengthMeta.color, fontWeight: 500 }}>{strengthMeta.label}</span>
                  </div>
                )}
              </div>

              <div>
                <label style={{ ...labelStyle, display: "block", marginBottom: 8 }}>Confirm Password</label>
                <InputField
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="Repeat your password"
                  icon={<Lock size={15} color="rgba(255,255,255,0.3)" />}
                  suffix={
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", display: "flex", padding: 0 }}>
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  }
                  autoComplete="new-password"
                  noLabel
                />
              </div>

              {error && <ErrorBox message={error} />}

              <p style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.25)", margin: "4px 0 0", lineHeight: 1.6 }}>
                By creating an account you agree to our{" "}
                <span style={{ color: "#a78bfa", cursor: "pointer" }}>Terms of Service</span>
                {" "}and{" "}
                <span style={{ color: "#a78bfa", cursor: "pointer" }}>Privacy Policy</span>.
              </p>

              <SubmitButton loading={loading} label="Create Account" />
            </form>

            <p style={{ textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.32)", marginTop: 24, marginBottom: 0 }}>
              Already have an account?{" "}
              <Link href="/login" style={{ color: "#a78bfa", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
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
  fontSize: 12, color: "rgba(255,255,255,0.42)",
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
          type={type} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} autoComplete={autoComplete}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "white", fontSize: 14 }}
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
      type="button" onClick={onClick} disabled={loading}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%", height: 48, borderRadius: 12,
        border: `1px solid ${hovered ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.09)"}`,
        background: hovered ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.04)",
        color: "white", fontWeight: 600, fontSize: 14,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        cursor: loading ? "wait" : "pointer",
        transition: "all 0.18s", marginBottom: 24,
      }}
    >
      {loading ? <Spinner /> : <><GoogleIcon />{label}</>}
    </button>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
      <div style={{ position: "absolute", width: "100%", height: 1, background: "rgba(255,255,255,0.07)" }} />
      <span style={{ position: "relative", background: "#04071a", padding: "0 14px", fontSize: 11, color: "rgba(255,255,255,0.22)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{label}</span>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)", color: "#fca5a5", borderRadius: 10, padding: "11px 14px", fontSize: 13, lineHeight: 1.5 }}>
      {message}
    </div>
  );
}

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="submit" disabled={loading}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%", height: 48, borderRadius: 12, border: "none",
        background: hovered && !loading
          ? "linear-gradient(135deg, #3b6fe8, #9333ea)"
          : "linear-gradient(135deg, #2563eb, #7c3aed)",
        color: "white", fontWeight: 700, fontSize: 15,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        cursor: loading ? "not-allowed" : "pointer",
        boxShadow: hovered && !loading ? "0 8px 28px rgba(99,102,241,0.45)" : "0 4px 16px rgba(99,102,241,0.25)",
        transform: hovered && !loading ? "translateY(-1px)" : "none",
        transition: "all 0.18s", opacity: loading ? 0.8 : 1, marginTop: 4,
      }}
    >
      {loading ? <Spinner /> : <>{label} <ArrowRight size={16} /></>}
    </button>
  );
}

function Spinner() {
  return <div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.25)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.75s linear infinite" }} />;
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