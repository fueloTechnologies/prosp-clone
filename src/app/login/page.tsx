"use client";
// src/app/login/page.tsx
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Heart, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("demo@prosp.ai");
  const [password, setPassword] = useState("demo123");
  const [loading, setLoading] = useState(false);
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
      setError("Invalid credentials. Use demo@prosp.ai");
      setLoading(false);
    } else {
      router.push("/sequences");
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] flex items-center justify-center px-6">
      {/* BACKGROUND GLOWS */}
      <div className="absolute top-[-200px] left-[-120px] w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[140px]" />
      <div className="absolute bottom-[-200px] right-[-120px] w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-[140px]" />

      {/* GRID */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="relative z-10 w-full max-w-md">
        {/* LOGO */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/30">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/30">
              <span className="text-white text-3xl font-black tracking-tight">
                LC
              </span>
            </div>
          </div>

          <h1 className="mt-5 text-4xl font-black bg-gradient-to-r from-white via-blue-100 to-purple-300 bg-clip-text text-transparent">
            LinkedIn-Connector
          </h1>

          <p className="text-gray-400 mt-3 text-lg">
            AI Powered LinkedIn Outreach
          </p>
        </div>

        {/* LOGIN CARD */}
        <div className="rounded-[36px] border border-white/10 bg-white/[0.05] backdrop-blur-2xl p-8 shadow-[0_0_60px_rgba(59,130,246,0.12)]">
          {/* HEADER */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles size={22} className="text-purple-400" />

              <h2 className="text-4xl font-bold text-white">Welcome Back</h2>
            </div>

            <p className="text-gray-400">
              Sign in to continue growing your outreach.
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* EMAIL */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Email Address
              </label>

              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 h-14 focus-within:border-blue-500/50 transition-all">
                <Mail size={18} className="text-gray-400" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="bg-transparent outline-none w-full text-white placeholder:text-gray-500"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Password
              </label>

              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 h-14 focus-within:border-purple-500/50 transition-all">
                <Lock size={18} className="text-gray-400" />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-transparent outline-none w-full text-white placeholder:text-gray-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-sm text-purple-400 hover:text-purple-300 transition"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-300 rounded-2xl p-4 text-sm">
                {error}
              </div>
            )}

            {/* FORGOT PASSWORD */}
            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm text-purple-400 hover:text-purple-300 transition"
              >
                Forgot Password?
              </button>
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="group w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-[1.02] transition-all duration-300 font-semibold text-lg flex items-center justify-center gap-2 shadow-2xl shadow-blue-500/20"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <>
                  Sign In
                  <ArrowRight
                    size={20}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </>
              )}
            </button>

            {/* DIVIDER */}
            <div className="relative flex items-center justify-center py-2">
              <div className="absolute w-full h-px bg-white/10" />

              <span className="relative bg-[#09111f] px-4 text-sm text-gray-500">
                OR CONTINUE WITH
              </span>
            </div>

            {/* GOOGLE BUTTON */}
            <button
              type="button"
              onClick={() =>
                signIn("google", {
                  callbackUrl: "/leads",
                })
              }
              className="w-full h-14 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-all text-white font-medium"
            >
              Continue with Google
            </button>

            {/* SIGNUP */}
            <p className="text-center text-gray-400 pt-2">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-purple-400 hover:text-purple-300 font-semibold"
              >
                Create account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
