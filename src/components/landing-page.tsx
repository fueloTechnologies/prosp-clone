"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, ArrowUp, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <main
      className="relative min-h-screen bg-[#050816] text-white overflow-x-hidden overflow-y-auto"
      style={{ height: "100vh" }}
    >
      {/* Premium Glow Effects */}
      <div className="absolute top-[-150px] left-[-100px] w-[500px] h-[500px] bg-blue-500/20 blur-[140px] rounded-full" />
      <div className="absolute bottom-[-150px] right-[-100px] w-[500px] h-[500px] bg-purple-500/20 blur-[140px] rounded-full" />
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-200px] left-[-100px] w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-200px] right-[-100px] w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full" />
      </div>
      <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/10 bg-[#050816]/70 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-20 h-[88px] flex items-center justify-between">
          {/* LEFT LOGO */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-2xl shadow-[0_0_30px_rgba(168,85,247,0.45)]">
              <div className="absolute inset-0 rounded-2xl bg-white/10" />
              <span className="relative z-10">LC</span>
            </div>

            <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-blue-100 to-purple-300 bg-clip-text text-transparent whitespace-nowrap">
              LinkedIn-Connector
            </h1>
          </div>

          {/* CENTER NAV */}
          <div className="hidden md:flex items-center gap-14 absolute left-1/2 -translate-x-1/2 text-gray-300 font-medium">
            <a
              href="#features"
              className="relative hover:text-white transition duration-300 after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-blue-400 after:to-purple-500 after:transition-all after:duration-300 hover:after:w-full"
            >
              Features
            </a>

            <a
              href="#pricing"
              className="relative hover:text-white transition duration-300 after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-blue-400 after:to-purple-500 after:transition-all after:duration-300 hover:after:w-full"
            >
              Pricing
            </a>

            <a
              href="#testimonials"
              className="relative hover:text-white transition duration-300 after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-blue-400 after:to-purple-500 after:transition-all after:duration-300 hover:after:w-full"
            >
              Testimonials
            </a>
          </div>

          {/* RIGHT BUTTONS */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <Link
              href="/login"
              className="px-6 py-3 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl hover:bg-white/10 hover:border-white/30 transition-all duration-300 text-white"
            >
              Login
            </Link>

            <Link
              href="/signup"
              className="px-7 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 font-semibold text-white"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>
      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-40 pb-20">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm">
          <Sparkles size={16} />
          AI Powered LinkedIn Automation
        </div>

        <h1 className="text-6xl md:text-8xl font-black leading-[0.95] tracking-tight max-w-6xl mt-8">
          <span className="bg-gradient-to-r from-white via-blue-100 to-purple-300 bg-clip-text text-transparent">
            AI-Powered
          </span>

          <br />

          <span className="text-white">LinkedIn Outreach</span>

          <br />

          <span className="animate-gradient bg-[linear-gradient(to_right,#60a5fa,#a855f7,#60a5fa)] bg-clip-text text-transparent">
            That Actually Converts
          </span>
        </h1>

        <p className="mt-8 text-xl text-gray-400 max-w-3xl leading-relaxed">
          Automate prospecting, generate AI personalized messages, send voice
          notes, and scale your outbound campaigns with a beautiful modern
          workflow.
        </p>

        <div className="flex flex-col sm:flex-row gap-5 mt-12">
          <Link
            href="/signup"
            className="group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-lg font-semibold flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/30"
          >
            Start Free Trial
            <ArrowRight
              size={20}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>

          <Link
            href="/login"
            className="px-8 py-4 rounded-2xl border border-white/20 bg-white/[0.03] backdrop-blur-xl hover:bg-white/10 hover:border-white/40 text-lg transition-all duration-300 text-white font-medium"
          >
            Login
          </Link>
        </div>
      </section>
      {/* Floating Stats */}
      <section className="relative z-10 px-6 lg:px-20 -mt-8 pb-20">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: "12M+", label: "Messages Sent" },
            { value: "4.8x", label: "Higher Replies" },
            { value: "15k+", label: "Active Users" },
            { value: "99.9%", label: "Automation Uptime" },
          ].map((item) => (
            <div
              key={item.label}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 text-center transition-all duration-500 hover:-translate-y-2 hover:border-blue-500/40 hover:shadow-2xl hover:shadow-blue-500/10"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 pointer-events-none" />
              <div className="relative z-10 text-4xl font-black bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                {item.value}
              </div>
              <div className="relative z-10 mt-3 text-gray-400">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="relative z-10 px-6 lg:px-20 pb-10">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-[32px] mt-10 border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden shadow-2xl shadow-blue-500/10">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/10 pointer-events-none" />
            <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></div>
              </div>
              <div className="text-sm font-medium tracking-wide text-gray-300">
                AI Campaign Dashboard
              </div>
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/20 text-blue-300 text-sm backdrop-blur-md">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                Live
              </div>
            </div>
            <div className="grid lg:grid-cols-3 gap-6 p-6">
              <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 transition-all duration-500 hover:-translate-y-2 hover:border-blue-500/40 hover:shadow-2xl hover:shadow-blue-500/20">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 pointer-events-none" />
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-blue-500/20 border border-blue-500/20">
                    <div className="text-sm text-gray-400">Active Campaigns</div>
                    <div className="text-4xl font-black mt-2">24</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.03]">
                    <div className="text-sm text-gray-400">AI Messages Sent</div>
                    <div className="text-3xl font-bold mt-2">12.4k</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.03]">
                    <div className="text-sm text-gray-400">Reply Rate</div>
                    <div className="text-3xl font-bold mt-2 text-green-400">37%</div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-black/20 p-6">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-bold">Campaign Performance</h3>
                    <p className="text-gray-400 mt-2">AI optimized outreach analytics</p>
                  </div>
                  <div className="px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm font-semibold whitespace-nowrap self-start">
                    +28% Growth
                  </div>
                </div>
                <div className="h-[220px] flex items-end gap-3 mt-4">
                  {[40, 65, 55, 80, 70, 90, 85, 100].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-2xl bg-gradient-to-t from-blue-600 to-purple-500 opacity-90 hover:opacity-100 transition-opacity duration-200"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Dashboard Preview */}
      <section className="relative z-10 px-6 lg:px-20 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-[40px] border border-white/10 bg-[#071120]/80 backdrop-blur-2xl shadow-[0_0_80px_rgba(59,130,246,0.08)]">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 pointer-events-none" />
            <div className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="text-gray-400 text-sm tracking-wide">AI Outreach Dashboard</div>
              <div className="flex items-center gap-2 px-4 py-1 rounded-full border border-green-500/20 bg-green-500/10 text-green-400 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Live
              </div>
            </div>
            <div className="relative z-10 grid lg:grid-cols-3 gap-8 p-8">
              {/* CARD 1 */}
              <div className="group rounded-[32px] border border-white/10 bg-gradient-to-br from-blue-500/10 to-transparent p-8 transition-all duration-500 hover:-translate-y-2 hover:border-blue-500/30 hover:shadow-[0_0_40px_rgba(59,130,246,0.15)]">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-white">Campaign Performance</h3>
                  <div className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs border border-blue-500/20">+28%</div>
                </div>
                <div className="mt-8 space-y-5">
                  <div>
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                      <span>Open Rate</span><span>92%</span>
                    </div>
                    <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                      <span>Reply Rate</span><span>71%</span>
                    </div>
                    <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full w-[71%] rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                      <span>Meetings Booked</span><span>48%</span>
                    </div>
                    <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full w-[48%] rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" />
                    </div>
                  </div>
                </div>
                <p className="mt-8 text-gray-400 leading-relaxed">
                  AI optimized campaigns increasing reply rates and generating more qualified meetings automatically.
                </p>
              </div>
              {/* CARD 2 */}
              <div className="group rounded-[32px] border border-white/10 bg-gradient-to-br from-purple-500/10 to-transparent p-8 transition-all duration-500 hover:-translate-y-2 hover:border-purple-500/30 hover:shadow-[0_0_40px_rgba(168,85,247,0.15)]">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-white">AI Message</h3>
                  <div className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 text-xs border border-purple-500/20">Personalized</div>
                </div>
                <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-gray-300 leading-relaxed shadow-inner">
                  Hey John, I noticed your recent expansion into SaaS sales and thought our AI outreach system could help automate prospecting while increasing reply rates dramatically.
                </div>
                <div className="mt-6 flex items-center gap-3 rounded-2xl border border-green-500/10 bg-green-500/5 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10 text-green-400">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <div className="text-green-400 font-semibold">Personalized Successfully</div>
                    <div className="text-gray-500 text-sm">Generated in 1.2 seconds</div>
                  </div>
                </div>
                <div className="mt-8 flex items-center gap-4">
                  <div className="flex -space-x-3">
                    <div className="w-10 h-10 rounded-full border-2 border-[#071120] bg-blue-500" />
                    <div className="w-10 h-10 rounded-full border-2 border-[#071120] bg-purple-500" />
                    <div className="w-10 h-10 rounded-full border-2 border-[#071120] bg-cyan-500" />
                  </div>
                  <div className="text-gray-400 text-sm">2,400+ AI messages sent today</div>
                </div>
              </div>
              {/* CARD 3 */}
              <div className="group rounded-[32px] border border-white/10 bg-gradient-to-br from-cyan-500/10 to-transparent p-8 transition-all duration-500 hover:-translate-y-2 hover:border-cyan-500/30 hover:shadow-[0_0_40px_rgba(34,211,238,0.15)]">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-white">Leads Generated</h3>
                  <div className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-xs border border-cyan-500/20">This Month</div>
                </div>
                <div className="mt-8">
                  <div className="text-7xl font-black bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">1,284</div>
                  <div className="mt-3 text-gray-400 text-lg">Qualified leads generated automatically.</div>
                </div>
                <div className="mt-10 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <div className="text-gray-400 text-sm">Meetings</div>
                    <div className="mt-2 text-3xl font-bold text-white">214</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <div className="text-gray-400 text-sm">Revenue</div>
                    <div className="mt-2 text-3xl font-bold text-green-400">$42k</div>
                  </div>
                </div>
                <div className="mt-8 h-3 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full w-[84%] rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500" />
                </div>
                <div className="mt-3 text-sm text-gray-500">84% growth compared to last month</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Features */}
      <section id="features" className="py-24 px-6 bg-[#020617]">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-white">Everything You Need</h2>
            <p className="text-gray-400 mt-6 text-lg">Built for agencies, founders, and outbound sales teams.</p>
          </div>
          {/* CARD 1 */}
          <div className="grid md:grid-cols-2 gap-10 items-center bg-[#0f172a] border border-white/10 rounded-3xl p-8 hover:border-blue-500/40 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center text-3xl mb-6">✨</div>
              <h2 className="text-4xl font-bold text-white mb-4">AI Personalization</h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                Create highly personalized outreach messages using AI trained on prospect activity and LinkedIn data.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl p-5 border border-white/10">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop"
                alt="AI Dashboard"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
          {/* CARD 2 */}
          <div className="grid md:grid-cols-2 gap-10 items-center bg-[#0f172a] border border-white/10 rounded-3xl hover:border-blue-500/40 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300">
            <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-3xl p-5 border border-white/10 order-2 md:order-1">
              <img
                src="https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=1200&auto=format&fit=crop"
                alt="LinkedIn Automation"
                className="rounded-2xl shadow-2xl"
              />
            </div>
            <div className="order-1 md:order-2 p-8">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-3xl mb-6">⚡</div>
              <h2 className="text-4xl font-bold text-white mb-4">LinkedIn Automation</h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                Automate connection requests, follow-ups, and outbound campaigns safely with smart scheduling.
              </p>
            </div>
          </div>
          {/* CARD 3 */}
          <div className="grid md:grid-cols-2 gap-10 items-center bg-[#0f172a] border border-white/10 rounded-3xl p-8 min-h-[420px] hover:border-blue-500/40 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300">
            <div className="flex flex-col justify-center">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center text-3xl mb-6">🎤</div>
              <h2 className="text-4xl font-bold text-white mb-4">Voice Notes</h2>
              <p className="text-gray-400 text-lg leading-relaxed max-w-xl">
                Send personalized AI-generated voice notes that increase reply rates and engagement.
              </p>
            </div>
            <div className="flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop"
                alt="Voice Notes"
                className="rounded-3xl shadow-2xl w-full max-w-[600px] h-[320px] object-cover border border-white/10"
              />
            </div>
          </div>
        </div>
      </section>
      {/* Pricing */}
      <section id="pricing" className="relative z-10 px-6 lg:px-20 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-purple-500/20 bg-purple-500/10 text-purple-300 text-sm mb-6 backdrop-blur-xl">
              💎 Flexible Pricing
            </div>
            <h2 className="text-6xl md:text-7xl font-black leading-tight">
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-300 bg-clip-text text-transparent">
                Simple Pricing
              </span>
            </h2>
            <p className="text-gray-400 text-xl mt-6 max-w-2xl mx-auto leading-relaxed">
              Scale your AI outreach with plans built for creators, startups, and agencies.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Starter",
                price: "$29",
                popular: false,
                gradient: "from-blue-500/20 to-cyan-500/10",
                icon: "⚡",
                description: "Perfect for creators and founders launching outbound campaigns.",
              },
              {
                name: "Pro",
                price: "$79",
                popular: true,
                gradient: "from-purple-500/20 to-blue-500/10",
                icon: "🚀",
                description: "Built for scaling startups and high-performing sales teams.",
              },
              {
                name: "Agency",
                price: "$199",
                popular: false,
                gradient: "from-pink-500/20 to-purple-500/10",
                icon: "🏆",
                description: "Advanced automation and analytics for modern outbound agencies.",
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`group relative overflow-hidden rounded-[36px] border border-white/10 bg-[#071120]/80 backdrop-blur-2xl p-8 transition-all duration-500 hover:-translate-y-4 hover:shadow-[0_0_60px_rgba(168,85,247,0.18)] ${
                  plan.popular
                    ? "scale-105 border-purple-500/40 shadow-purple-500/20"
                    : "hover:border-blue-500/30"
                }`}
              >
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br ${plan.gradient}`} />
                {plan.popular && (
                  <div className="absolute top-5 right-5 px-4 py-1 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-xs font-bold text-white shadow-lg shadow-purple-500/30">
                    🔥 MOST POPULAR
                  </div>
                )}
                <div className="relative z-10 w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl backdrop-blur-xl">
                  {plan.icon}
                </div>
                <h3 className="text-3xl font-bold text-white mt-8 relative z-10">{plan.name}</h3>
                <p className="text-gray-400 mt-4 leading-relaxed relative z-10">{plan.description}</p>
                <div className="mt-10 flex items-end gap-2 relative z-10">
                  <span className="text-7xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{plan.price}</span>
                  <span className="text-gray-400 text-xl mb-3">/mo</span>
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-8 relative z-10" />
                <div className="space-y-5 relative z-10">
                  {["Unlimited Campaigns", "AI Personalization", "Voice Note Automation", "Advanced Analytics", "Priority Support"].map((feature) => (
                    <div key={feature} className="flex items-center gap-4 text-gray-300">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-xs text-white shadow-lg">✓</div>
                      <span className="text-[15px]">{feature}</span>
                    </div>
                  ))}
                </div>
                <button
                  className={`w-full mt-10 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 relative z-10 ${
                    plan.popular
                      ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:scale-[1.03] shadow-2xl shadow-purple-500/30"
                      : "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20"
                  }`}
                >
                  Get Started
                </button>
                <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-purple-500/10 blur-[80px]" />
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Testimonials */}
      <section id="testimonials" className="relative z-10 px-6 lg:px-20 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-purple-500/20 bg-purple-500/10 text-purple-300 text-sm mb-6 backdrop-blur-xl">
              🚀 Trusted by Growth Teams
            </div>
            <h2 className="text-5xl md:text-7xl font-black leading-tight">
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-300 bg-clip-text text-transparent">
                Loved By Teams
              </span>
            </h2>
            <p className="text-gray-400 text-xl mt-6 max-w-2xl mx-auto leading-relaxed">
              See why founders, agencies, and outbound teams are scaling faster with AI-powered outreach automation.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Mitchell",
                role: "Growth Lead @ NovaAI",
                image: "https://randomuser.me/api/portraits/women/44.jpg",
                review: "This platform completely transformed our outbound workflow. We increased reply rates by 4x in under 3 weeks.",
              },
              {
                name: "David Chen",
                role: "Founder @ ScaleFlow",
                image: "https://randomuser.me/api/portraits/men/32.jpg",
                review: "The AI personalization is insanely good. It feels like having an SDR team running 24/7 without the overhead.",
              },
              {
                name: "Emily Carter",
                role: "Sales Director @ LeadBoost",
                image: "https://randomuser.me/api/portraits/women/68.jpg",
                review: "Voice notes + LinkedIn automation together are a game changer. Our demos doubled after switching.",
              },
            ].map((item) => (
              <div
                key={item.name}
                className="group relative overflow-hidden rounded-[36px] border border-white/10 bg-[#071120]/80 backdrop-blur-2xl p-8 transition-all duration-500 hover:-translate-y-4 hover:border-purple-500/30 hover:shadow-[0_0_60px_rgba(168,85,247,0.18)]"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10" />
                <div className="absolute top-6 right-6 text-6xl text-white/5 font-black">"</div>
                <div className="flex gap-1 mb-6 relative z-10">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="text-yellow-400 text-xl drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]">⭐</span>
                  ))}
                </div>
                <p className="text-gray-300 leading-relaxed text-lg relative z-10 min-h-[150px]">"{item.review}"</p>
                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-8" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="relative">
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-full object-cover border-2 border-white/10 shadow-xl" />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-400 border-2 border-[#071120]" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg">{item.name}</h4>
                    <p className="text-gray-400 text-sm">{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Scroll To Top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-2xl shadow-purple-500/30 hover:scale-110 transition-all duration-300 flex items-center justify-center backdrop-blur-xl border border-white/10"
      >
        <ArrowUp size={24} />
      </button>
      {/* CTA */}
      <motion.section
        initial={{ opacity: 0, y: 80 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="relative z-10 px-6 lg:px-20 pb-32"
      >
        <div className="max-w-6xl mx-auto rounded-[40px] border border-white/10 bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-16 text-center overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.2),transparent_60%)]" />
          <div className="relative z-10">
            <h2 className="text-5xl md:text-6xl font-black text-white leading-tight">
              Ready To Scale
              <br />
              Your Outreach?
            </h2>
            <p className="text-gray-400 text-xl mt-6 max-w-2xl mx-auto leading-relaxed">
              Join thousands of founders and sales teams using AI to automate LinkedIn growth.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mt-10">
              <Link
                href="/signup"
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 font-semibold text-lg hover:scale-105 transition-all duration-300 shadow-2xl shadow-blue-500/20"
              >
                Start Free Trial
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/10 transition-all duration-300"
              >
                Book Demo
              </Link>
            </div>
          </div>
        </div>
      </motion.section>
      {/* Office Grid */}
      <section className="relative z-10 px-6 lg:px-20 pb-32">
        <div className="max-w-7xl mx-auto grid xl:grid-cols-2 gap-10">
          {[
            {
              flag: "https://flagcdn.com/w80/in.png",
              flagAlt: "India",
              city: "Bangalore",
              type: "CORPORATE HEAD OFFICE",
              address: "Plot No 6, 4th A Cross, Outer Ring Rd, Kasturi Nagar, Bengaluru — 560043",
              phone: "+91 88888 57588",
              email: "sales@linkedinconnector.ai",
              glow: "from-cyan-500/20 via-blue-500/10 to-transparent",
              border: "hover:border-cyan-400/40",
            },
            {
              flag: "https://flagcdn.com/w80/in.png",
              flagAlt: "India",
              city: "Pune",
              type: "REGIONAL OFFICE",
              address: "Team Space Yard, Axis Proxima, Pune–Mumbai Highway, Pune 411034",
              phone: "+91 88888 57588",
              email: "sales@linkedinconnector.ai",
              glow: "from-blue-500/20 via-indigo-500/10 to-transparent",
              border: "hover:border-blue-400/40",
            },
            {
              flag: "https://flagcdn.com/w80/pl.png",
              flagAlt: "Poland",
              city: "Poland",
              type: "GLOBAL OFFICE",
              address: "ul. Malomicka 55/36, 59-300 Lubin, Poland",
              phone: "+48 72 109 2485",
              email: "sales@linkedinconnector.ai",
              glow: "from-sky-500/20 via-cyan-500/10 to-transparent",
              border: "hover:border-sky-400/40",
            },
            {
              flag: "https://flagcdn.com/w80/us.png",
              flagAlt: "United States",
              city: "United States",
              type: "BRANCH OFFICE",
              address: "8 The Green, Suite B, Dover, Delaware 19901, USA",
              phone: "+1 67 837 88493",
              email: "sales@linkedinconnector.ai",
              glow: "from-fuchsia-500/20 via-purple-500/10 to-transparent",
              border: "hover:border-fuchsia-400/40",
            },
          ].map((office, i) => (
            <div
              key={i}
              className={`group relative overflow-hidden rounded-[42px] border border-white/10 bg-[rgba(7,17,32,0.78)] backdrop-blur-3xl p-10 md:p-12 transition-all duration-700 hover:-translate-y-4 hover:shadow-[0_30px_120px_rgba(59,130,246,0.18)] ${office.border}`}
            >
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700 bg-gradient-to-br ${office.glow}`} />
              <div className="absolute -top-52 -right-52 w-[420px] h-[420px] rounded-full bg-white/[0.05] blur-[180px]" />
              <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:70px_70px]" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-1000 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.05),transparent)] translate-x-[-120%] group-hover:translate-x-[120%]" />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-14">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-[30px] bg-cyan-500/20 blur-3xl opacity-50" />
                      <div className="relative w-24 h-24 rounded-[30px] border border-white/10 bg-white/[0.05] backdrop-blur-2xl flex items-center justify-center shadow-[0_25px_80px_rgba(0,0,0,0.45)] overflow-hidden">
                        <img src={office.flag} alt={office.flagAlt} className="w-16 h-auto object-cover rounded-lg shadow-lg" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-5xl md:text-6xl font-black text-white tracking-tight leading-none">{office.city}</h3>
                      <div className="mt-4 flex items-center gap-4">
                        <div className="w-12 h-px bg-cyan-400/70" />
                        <span className="text-cyan-300 tracking-[0.35em] text-xs font-black uppercase">{office.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-2 px-5 py-2 rounded-full border border-green-500/20 bg-green-500/10 text-green-400 text-xs font-black tracking-[0.25em] shadow-[0_0_30px_rgba(34,197,94,0.15)]">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    ACTIVE
                  </div>
                </div>
                <div className="h-px bg-gradient-to-r from-white/15 to-transparent mb-12" />
                <div className="space-y-8">
                  <div className="flex gap-5">
                    <div className="min-w-[72px] h-[72px] rounded-3xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-3xl shadow-inner">📍</div>
                    <div>
                      <div className="text-gray-500 uppercase tracking-[0.35em] text-xs font-black mb-3">Address</div>
                      <div className="text-gray-200 text-2xl leading-relaxed font-medium">{office.address}</div>
                    </div>
                  </div>
                  <div className="flex gap-5">
                    <div className="min-w-[72px] h-[72px] rounded-3xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-3xl shadow-inner">☎️</div>
                    <div>
                      <div className="text-gray-500 uppercase tracking-[0.35em] text-xs font-black mb-3">Phone</div>
                      <div className="text-4xl font-black text-white tracking-tight">{office.phone}</div>
                    </div>
                  </div>
                  <div className="flex gap-5">
                    <div className="min-w-[72px] h-[72px] rounded-3xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-3xl shadow-inner">✉️</div>
                    <div>
                      <div className="text-gray-500 uppercase tracking-[0.35em] text-xs font-black mb-3">Email</div>
                      <div className="text-gray-200 text-2xl font-medium">{office.email}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-[#040714] overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-[-150px] right-[-150px] w-[400px] h-[400px] bg-purple-500/10 blur-[120px] rounded-full" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-20 py-20">
          <div className="grid lg:grid-cols-3 gap-16">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-purple-500/20">LC</div>
                <div>
                  <h3 className="text-2xl font-black text-white">LinkedIn-Connector</h3>
                  <p className="text-sm text-gray-500">AI Powered Outreach Automation</p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed max-w-md">
                Scale your LinkedIn outreach using AI-powered automation, personalized messaging, and smart campaign workflows.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold tracking-[0.2em] text-sm mb-8">COMPANY DETAILS</h4>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl border border-white/10 bg-white/[0.03] flex items-center justify-center text-xl">🏢</div>
                  <div>
                    <div className="text-xs tracking-[0.2em] text-gray-500 mb-2">LEGAL ENTITY</div>
                    <div className="text-gray-200 leading-relaxed">FUELO TECHNOLOGIES (OPC) PRIVATE LIMITED</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl border border-white/10 bg-white/[0.03] flex items-center justify-center text-xl">🪪</div>
                  <div>
                    <div className="text-gray-300">CIN: U72900KA2022OPC166090</div>
                    <div className="text-gray-400 mt-1">GSTIN: 29AAFCF2179R1ZT</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl border border-white/10 bg-white/[0.03] flex items-center justify-center text-xl">📍</div>
                  <div>
                    <div className="text-xs tracking-[0.2em] text-gray-500 mb-2">ADDRESS</div>
                    <div className="text-gray-300 leading-relaxed">
                      Plot No 6, 4th A Cross, Outer Ring Rd,<br />
                      Kasturi Nagar, Bengaluru — 560043
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-between">
              <div>
                <h4 className="text-white font-bold tracking-[0.2em] text-sm mb-8">QUICK LINKS</h4>
                <div className="flex flex-col gap-4 text-gray-400">
                  <a href="#features" className="hover:text-white transition">Features</a>
                  <a href="#pricing" className="hover:text-white transition">Pricing</a>
                  <a href="#testimonials" className="hover:text-white transition">Testimonials</a>
                </div>
              </div>
              <a
                href="tel:+918888857588"
                className="mt-10 inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 px-8 py-5 text-lg font-semibold text-white shadow-2xl shadow-cyan-500/20 hover:scale-105 transition-all duration-300"
              >
                📞 Call +91 88888 57588
              </a>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <div>© 2026 LinkedIn-Connector. All rights reserved.</div>
            <div>Built with AI automation for modern outbound teams.</div>
          </div>
        </div>
      </footer>
    </main>
  );
}