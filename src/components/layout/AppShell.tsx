"use client";
// src/components/layout/AppShell.tsx

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Network,
  FileSearch,
  Inbox,
  LayoutDashboard,
  Megaphone,
  Users,
  Mic,
  Mail,
  GraduationCap,
  BookOpen,
  Settings,
  Heart,
  Crown,
  Share2,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect } from "react";

const NAV_TABS = [
  { key: "sequences", label: "Sequences", icon: Network, href: "/sequences" },
  { key: "leads", label: "Find leads", icon: FileSearch, href: "/leads" },
  { key: "inbox", label: "Unified Inbox", icon: Inbox, href: "/inbox" },
];

const SIDEBAR_ICONS = [
  { icon: LayoutDashboard, key: "dashboard", title: "Dashboard" },
  { icon: Megaphone, key: "campaigns", title: "Campaigns" },
  { icon: Users, key: "contacts", title: "Contacts" },
  { icon: Mic, key: "voice", title: "Voice" },
  { icon: Mail, key: "email", title: "Email" },
  { icon: GraduationCap, key: "training", title: "Training" },
  { icon: BookOpen, key: "playbooks", title: "Playbooks" },
];

const ROUTES: Record<string, string> = {
  dashboard: "/dashboard",
  campaigns: "/sequences",
  contacts: "/leads",
  voice: "/dashboard/voice",
  email: "/inbox",
  training: "/training",
  playbooks: "/playbooks",
};

interface AppShellProps {
  children: React.ReactNode;
  activeTab: string;
}

export default function AppShell({ children, activeTab }: AppShellProps) {
  const { data: session } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    if (session?.user?.image) setAvatarUrl(session.user.image);
    fetch("/api/settings/general")
      .then((r) => r.json())
      .then((d) => {
        if (d.avatar) setAvatarUrl(d.avatar);
      })
      .catch(() => {});
  }, [session]);

  const referralLink = `https://prosp.ai?ref=${session?.user?.email?.split("@")[0] || "friend"}`;

  function handleCopy() {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const initials =
    session?.user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "YD";

  return (
    // Full viewport, no outer card
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#f7f7fb]">
      {/* ── Top nav bar ── */}
      <nav className="flex-shrink-0 flex items-center justify-between px-6 h-14 bg-white border-b border-gray-100 z-30">
        {/* Center tabs */}
        <div className="flex items-center gap-1">
          {NAV_TABS.map((tab) => (
            <Link
              key={tab.key}
              href={tab.href}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-violet-100 text-violet-700"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              }`}
            >
              <tab.icon size={15} />
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium transition"
          >
            <Share2 size={13} /> Share
          </button>

          <div className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
            <Crown size={13} className="text-amber-500" />
            <span className="text-xs font-semibold text-amber-700">
              Days of free trial: 14
            </span>
          </div>

          <button
            onClick={() => router.push("/settings")}
            className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition"
          >
            <Settings size={16} className="text-gray-500" />
          </button>

          {/* Avatar + dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-9 h-9 rounded-full overflow-hidden border-2 border-violet-200 hover:border-violet-400 transition flex-shrink-0"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={initials}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold">
                  {initials}
                </div>
              )}
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 top-11 bg-white border border-gray-100 rounded-xl shadow-xl w-52 py-2 z-50">
                  <div className="flex items-center gap-3 px-3 py-2 border-b border-gray-100 mb-1">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={initials}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold">
                          {initials}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {session?.user?.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {session?.user?.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
                  >
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Body: sidebar + content ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Slim icon sidebar */}
        <aside className="flex-shrink-0 w-14 bg-white border-r border-gray-100 flex flex-col items-center py-4 gap-1 z-20">
          {/* Logo mark */}
          <div className="w-8 h-8 bg-violet-600 rounded-xl flex items-center justify-center mb-4 flex-shrink-0">
            <Heart size={14} className="text-white fill-white" />
          </div>

          {SIDEBAR_ICONS.map(({ icon: Icon, key, title }) => (
            <button
              key={key}
              title={title}
              onClick={() => {
                if (ROUTES[key]) router.push(ROUTES[key]);
              }}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                activeTab === key
                  ? "bg-violet-100 text-violet-700"
                  : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              }`}
            >
              <Icon size={18} />
            </button>
          ))}

          {/* Settings at bottom */}
          <div className="mt-auto">
            <button
              onClick={() => router.push("/settings")}
              title="Settings"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                activeTab === "settings"
                  ? "bg-violet-100 text-violet-700"
                  : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              }`}
            >
              <Settings size={18} />
            </button>
          </div>
        </aside>

        {/* Main scrollable content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      {/* ── Share Modal ── */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl w-[420px] p-6 relative">
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center">
                <Share2 size={18} className="text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-base">
                  Invite Friends to Prosp
                </h2>
                <p className="text-xs text-gray-500">
                  Share your referral link and earn rewards
                </p>
              </div>
            </div>
            <hr className="my-4" />
            <p className="text-sm font-medium text-gray-700 mb-2">
              Your referral link
            </p>
            <div className="flex items-center gap-2 bg-gray-50 border rounded-xl px-3 py-2 mb-4">
              <span className="text-sm text-gray-600 flex-1 truncate">
                {referralLink}
              </span>
              <button
                onClick={handleCopy}
                className="text-xs bg-violet-600 text-white px-3 py-1 rounded-lg hover:bg-violet-700 transition"
              >
                {copied ? "✓ Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-sm font-medium text-gray-700 mb-2">Share via</p>
            <div className="flex gap-2">
              {[
                {
                  label: "LinkedIn",
                  color: "text-blue-600 hover:bg-blue-50 hover:border-blue-300",
                  url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`,
                },
                {
                  label: "Twitter",
                  color: "text-sky-500 hover:bg-sky-50 hover:border-sky-300",
                  url: `https://twitter.com/intent/tweet?text=Check out Prosp AI!&url=${encodeURIComponent(referralLink)}`,
                },
                {
                  label: "Email",
                  color: "text-gray-600 hover:bg-gray-100",
                  url: `mailto:?subject=Try Prosp AI&body=Hey! Check out Prosp AI: ${referralLink}`,
                },
              ].map((s) => (
                <button
                  key={s.label}
                  onClick={() => window.open(s.url, "_blank")}
                  className={`flex-1 border rounded-xl py-2 text-sm font-medium transition ${s.color}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
