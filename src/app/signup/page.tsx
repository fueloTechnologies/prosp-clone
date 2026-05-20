"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Signup failed");
        return;
      }

      router.push("/login");
    } catch (err) {
      console.log(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] flex items-center justify-center px-6 py-16">
      {/* GLOW EFFECTS */}
      <div className="absolute top-[-200px] left-[-120px] w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[140px]" />
      <div className="absolute bottom-[-200px] right-[-120px] w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-[140px]" />

      {/* GRID */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="relative z-10 w-full max-w-md">
        {/* LOGO */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/30">
            <span className="text-white text-3xl font-black tracking-tight">
              LC
            </span>
          </div>

          <h1 className="mt-5 text-4xl font-black bg-gradient-to-r from-white via-blue-100 to-purple-300 bg-clip-text text-transparent">
            LinkedIn-Connector
          </h1>

          <p className="text-gray-400 mt-3 text-lg">
            AI Powered LinkedIn Outreach
          </p>
        </div>

        {/* CARD */}
        <div className="rounded-[36px] border border-white/10 bg-white/[0.05] backdrop-blur-2xl p-8 shadow-[0_0_60px_rgba(59,130,246,0.12)]">
          {/* HEADER */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-white">Create Account</h2>

            <p className="text-gray-400 mt-3">Start your AI outreach journey</p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSignup} className="space-y-6">
            {/* NAME */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Full Name
              </label>

              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-14 px-5 rounded-2xl border border-white/10 bg-white/[0.03] text-white placeholder:text-gray-500 outline-none focus:border-blue-500/50 transition-all"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Email Address
              </label>

              <input
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-14 px-5 rounded-2xl border border-white/10 bg-white/[0.03] text-white placeholder:text-gray-500 outline-none focus:border-blue-500/50 transition-all"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Password
              </label>

              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-14 px-5 rounded-2xl border border-white/10 bg-white/[0.03] text-white placeholder:text-gray-500 outline-none focus:border-purple-500/50 transition-all"
              />
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Confirm Password
              </label>

              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-14 px-5 rounded-2xl border border-white/10 bg-white/[0.03] text-white placeholder:text-gray-500 outline-none focus:border-purple-500/50 transition-all"
              />
            </div>

            {/* ERROR */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-300 rounded-2xl p-4 text-sm">
                {error}
              </div>
            )}

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-[1.02] transition-all duration-300 font-semibold text-lg shadow-2xl shadow-blue-500/20"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* LOGIN */}
          <div className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-purple-400 font-medium hover:text-purple-300"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
