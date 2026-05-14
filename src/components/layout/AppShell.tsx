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
} from "lucide-react";
import { useState } from "react";

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

interface AppShellProps {
  children: React.ReactNode;
  activeTab: string;
}

export default function AppShell({ children, activeTab }: AppShellProps) {
  const { data: session } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const referralLink = `https://prosp.ai?ref=${session?.user?.email?.split("@")[0] || "friend"}`;

  function handleCopy() {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  const router = useRouter();

  const ROUTES: Record<string, string> = {
    dashboard: "/dashboard",
    campaigns: "/sequences",
    contacts: "/leads",
    voice: "dashboard/voice",
    email: "/inbox",
    training: "/training",
    playbooks: "/playbooks",
  };

  const initials =
    session?.user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "YD";

  return (
    <div className="app-shell">
      <div className="app-card">
        {/* ── Top navigation ── */}
        <nav className="top-nav relative">
          <div className="flex items-center gap-1">
            {NAV_TABS.map((tab) => (
              <Link
                key={tab.key}
                href={tab.href}
                className={`nav-tab ${activeTab === tab.key ? "active" : ""}`}
              >
                <tab.icon size={15} />
                {tab.label}
              </Link>
            ))}
          </div>

          {/* Right side controls */}
          <div className="absolute right-5 flex items-center gap-3">
            <button
              onClick={() => setShowShareModal(true)}
              className="btn-primary py-2 px-4 text-sm"
            >
              <Share2 size={13} /> Share
            </button>
            <div className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
              <Crown size={13} className="text-amber-500" />
              <span className="text-xs font-semibold text-amber-700">
                Days of free trial: 14
              </span>
            </div>
            {/* User avatar + dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:bg-brand-600 transition-colors"
              >
                {initials}
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-10 bg-white border border-border rounded-xl shadow-modal w-48 py-2 z-50">
                  <div className="px-3 py-2 border-b border-border mb-1">
                    <p className="text-sm font-medium text-ink truncate">
                      {session?.user?.name}
                    </p>
                    <p className="text-xs text-ink-tertiary truncate">
                      {session?.user?.email}
                    </p>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink-secondary hover:bg-surface-secondary hover:text-ink transition-colors"
                  >
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* ── Body ── */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="sidebar">
            {/* Logo */}
            <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center mb-6 flex-shrink-0">
              <Heart size={15} className="text-white fill-white" />
            </div>

            {SIDEBAR_ICONS.map(({ icon: Icon, key, title }) => {
              const route = ROUTES[key];

              return (
                <button
                  key={key}
                  title={title}
                  onClick={() => {
                    if (route) {
                      router.push(route);
                    }
                  }}
                  className={`sidebar-icon ${activeTab === key ? "active" : ""}`}
                >
                  <Icon size={18} />
                </button>
              );
            })}

            <div className="mt-auto">
              <button
                title="Settings"
                onClick={() => router.push("/settings")}
                className="sidebar-icon"
              >
                <Settings size={18} />
              </button>
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1 overflow-hidden flex flex-col">{children}</div>
        </div>
      </div>
      {/* Share Modal */} {/* ✅ ADD HERE — before the closing ); */}
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
              <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
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
                className="text-xs bg-brand-500 text-white px-3 py-1 rounded-lg hover:bg-brand-600 transition"
              >
                {copied ? "✓ Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-sm font-medium text-gray-700 mb-2">Share via</p>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  window.open(
                    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`,
                    "_blank",
                  )
                }
                className="flex-1 border rounded-xl py-2 text-sm hover:bg-blue-50 hover:border-blue-300 transition text-blue-600 font-medium"
              >
                LinkedIn
              </button>
              <button
                onClick={() =>
                  window.open(
                    `https://twitter.com/intent/tweet?text=Check out Prosp AI!&url=${encodeURIComponent(referralLink)}`,
                    "_blank",
                  )
                }
                className="flex-1 border rounded-xl py-2 text-sm hover:bg-sky-50 hover:border-sky-300 transition text-sky-500 font-medium"
              >
                Twitter
              </button>
              <button
                onClick={() =>
                  window.open(
                    `mailto:?subject=Try Prosp AI&body=Hey! Check out Prosp AI: ${referralLink}`,
                    "_blank",
                  )
                }
                className="flex-1 border rounded-xl py-2 text-sm hover:bg-gray-100 transition text-gray-600 font-medium"
              >
                Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
