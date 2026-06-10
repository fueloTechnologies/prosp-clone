"use client";
// src/app/settings/page.tsx

import AppShell from "@/components/layout/AppShell";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import AccountsTab from "@/components/settings/AccountsTab"; // ✅ imported from separate file

import {
  Linkedin,
  X,
  Globe,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  RefreshCw,
  Plus,
  Zap,
  Code2,
  Users,
  CreditCard,
  Mic,
  Palette,
  Webhook,
  Settings2,
  Play,
  Upload,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
} from "lucide-react";

/* ─── Helpers ─── */
function Banner({
  type,
  msg,
}: {
  type: "success" | "error" | "warning" | "";
  msg: string;
}) {
  if (!msg) return null;
  const styles: Record<string, string> = {
    success: "bg-green-50 text-green-700 border border-green-200",
    error: "bg-red-50 text-red-600 border border-red-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
  };
  const icons: Record<string, React.ReactNode> = {
    success: <CheckCircle2 size={15} />,
    error: <AlertCircle size={15} />,
    warning: <AlertTriangle size={15} />,
  };
  return (
    <div
      className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${styles[type] || styles.error}`}
    >
      {icons[type]}
      {msg}
    </div>
  );
}

const TABS = [
  { id: "general", label: "General", icon: Settings2 },
  { id: "accounts", label: "Accounts", icon: Linkedin },
  { id: "members", label: "Members", icon: Users },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "voice", label: "Voice Cloner", icon: Mic },
  { id: "whitelabel", label: "White Label", icon: Palette },
  { id: "webhooks", label: "Webhooks", icon: Webhook },
  { id: "integrations", label: "Integrations", icon: Zap },
];

const TIMEZONES = [
  "Asia/Kolkata",
  "America/New_York",
  "America/Los_Angeles",
  "America/Chicago",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "Asia/Singapore",
  "Asia/Dubai",
  "Australia/Sydney",
];

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <AppShell activeTab="settings">
      <div className="flex h-full bg-[#f7f7fb]">
        {/* Sidebar */}
        <div className="w-[240px] bg-white border-r border-gray-200 p-5 flex-shrink-0">
          <h1 className="text-2xl font-bold mb-6 px-2">Settings</h1>
          <div className="space-y-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl flex items-center gap-3 text-sm transition ${activeTab === tab.id ? "bg-violet-100 text-violet-700 font-semibold" : "hover:bg-gray-100 text-gray-600"}`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          {activeTab === "general" && <GeneralTab />}
          {activeTab === "accounts" && <AccountsTab />}{" "}
          {/* ✅ uses imported component */}
          {activeTab === "members" && <MembersTab />}
          {activeTab === "billing" && <BillingTab />}
          {activeTab === "voice" && <VoiceTab />}
          {activeTab === "whitelabel" && <WhiteLabelTab />}
          {activeTab === "webhooks" && <WebhooksTab />}
          {activeTab === "integrations" && <IntegrationsTab />}
        </div>
      </div>
    </AppShell>
  );
}

/* ══════════════════════════════════════════════
   GENERAL TAB
══════════════════════════════════════════════ */
function GeneralTab() {
  const { data: session } = useSession();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [workspace, setWorkspace] = useState("");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [language, setLanguage] = useState("English");
  const [avatar, setAvatar] = useState("");
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState({ type: "" as any, msg: "" });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (session?.user?.name) {
      const parts = session.user.name.split(" ");
      setFirstName(parts[0] || "");
      setLastName(parts.slice(1).join(" ") || "");
    }
    fetch("/api/settings/general")
      .then((r) => r.json())
      .then((d) => {
        if (d.workspaceName) setWorkspace(d.workspaceName);
        if (d.timezone) setTimezone(d.timezone);
        if (d.language) setLanguage(d.language);
        if (d.avatar) setAvatar(d.avatar);
      })
      .catch(() => {});
  }, [session]);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 200;
        let w = img.width,
          h = img.height;
        if (w > h) {
          h = Math.round((h / w) * MAX);
          w = MAX;
        } else {
          w = Math.round((w / h) * MAX);
          h = MAX;
        }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  const handlePhoto = async (file: File) => {
    try {
      const compressed = await compressImage(file);
      setAvatar(compressed);
      await fetch("/api/settings/general", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          workspaceName: workspace,
          timezone,
          language,
          avatar: compressed,
        }),
      });
      setBanner({ type: "success", msg: "Photo updated!" });
      setTimeout(() => setBanner({ type: "", msg: "" }), 2000);
    } catch {
      setBanner({ type: "error", msg: "Failed to upload photo." });
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings/general", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          workspaceName: workspace,
          timezone,
          language,
          avatar,
        }),
      });
      if (!res.ok) throw new Error();
      setBanner({ type: "success", msg: "Settings saved successfully!" });
    } catch {
      setBanner({ type: "error", msg: "Failed to save settings." });
    } finally {
      setSaving(false);
      setTimeout(() => setBanner({ type: "", msg: "" }), 3000);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">General Settings</h1>
      <p className="text-gray-500 mt-1 mb-6">
        Manage your workspace and profile settings
      </p>

      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-5 pb-6 border-b border-gray-100">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
              {avatar ? (
                <img src={avatar} className="w-full h-full object-cover" />
              ) : (
                firstName?.[0]?.toUpperCase() || "U"
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-violet-600 text-white rounded-full flex items-center justify-center hover:bg-violet-700 transition shadow-md"
            >
              <Upload size={12} />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                e.target.files?.[0] && handlePhoto(e.target.files[0])
              }
            />
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {session?.user?.name || "Your Name"}
            </p>
            <p className="text-sm text-gray-500">{session?.user?.email}</p>
            <button
              onClick={() => fileRef.current?.click()}
              className="text-xs text-violet-600 hover:underline mt-1"
            >
              Change photo
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="John"
              className="mt-1.5 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Doe"
              className="mt-1.5 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Workspace Name
          </label>
          <input
            value={workspace}
            onChange={(e) => setWorkspace(e.target.value)}
            placeholder="My Workspace"
            className="mt-1.5 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            value={session?.user?.email || ""}
            disabled
            className="mt-1.5 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="mt-1.5 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {TIMEZONES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="mt-1.5 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {[
                "English",
                "Spanish",
                "French",
                "German",
                "Portuguese",
                "Hindi",
              ].map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        <Banner type={banner.type} msg={banner.msg} />

        <button
          onClick={save}
          disabled={saving}
          className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition flex items-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Saving…
            </>
          ) : (
            "Save Settings"
          )}
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MEMBERS TAB
══════════════════════════════════════════════ */
function MembersTab() {
  const { data: session } = useSession();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [members, setMembers] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState({ type: "" as any, msg: "" });

  const ROLE_PERMISSIONS: Record<string, string[]> = {
    owner: [
      "Full access",
      "Billing",
      "Add/remove members",
      "All campaigns",
      "All accounts",
    ],
    admin: [
      "All campaigns",
      "All accounts",
      "Add members",
      "No billing access",
    ],
    member: [
      "Assigned campaigns only",
      "Own account only",
      "No member management",
    ],
  };

  useEffect(() => {
    fetch("/api/settings/members")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setMembers(d);
      })
      .catch(() => {});
  }, []);

  const invite = async () => {
    if (!inviteEmail.includes("@")) {
      setBanner({ type: "error", msg: "Enter a valid email" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/settings/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      if (!res.ok) throw new Error();
      setBanner({ type: "success", msg: `Invite sent to ${inviteEmail}` });
      setInviteEmail("");
      fetch("/api/settings/members")
        .then((r) => r.json())
        .then((d) => {
          if (Array.isArray(d)) setMembers(d);
        });
    } catch {
      setBanner({ type: "error", msg: "Failed to send invite." });
    } finally {
      setSaving(false);
      setTimeout(() => setBanner({ type: "", msg: "" }), 3000);
    }
  };

  const removeMember = async (email: string) => {
    if (!confirm(`Remove ${email}?`)) return;
    await fetch("/api/settings/members", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setMembers((prev) => prev.filter((m) => m.email !== email));
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Members</h1>
      <p className="text-gray-500 mt-1 mb-6">
        Manage workspace members and permissions
      </p>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Invite Member</h2>
        <div className="flex gap-3">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="colleague@company.com"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
          <button
            onClick={invite}
            disabled={saving}
            className="px-4 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition flex items-center gap-2"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Plus size={14} />
            )}{" "}
            Invite
          </button>
        </div>
        <Banner type={banner.type} msg={banner.msg} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Role Permissions</h2>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(ROLE_PERMISSIONS).map(([role, perms]) => (
            <div key={role} className="border border-gray-100 rounded-xl p-4">
              <p className="font-semibold text-sm text-gray-900 capitalize mb-2">
                {role}
              </p>
              <ul className="space-y-1.5">
                {perms.map((p) => (
                  <li
                    key={p}
                    className="text-xs text-gray-500 flex items-start gap-1.5"
                  >
                    <CheckCircle2
                      size={11}
                      className="text-violet-500 mt-0.5 flex-shrink-0"
                    />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Team Members</h2>
          <span className="text-xs text-gray-400">
            {1 + members.length} member{members.length !== 0 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-semibold text-sm">
              {session?.user?.name?.[0]?.toUpperCase() || "Y"}
            </div>
            <div>
              <p className="font-medium text-sm text-gray-900">
                {session?.user?.name || "You"}
              </p>
              <p className="text-xs text-gray-400">{session?.user?.email}</p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 font-medium">
            Owner
          </span>
        </div>
        {members.map((m, i) => (
          <div
            key={i}
            className="flex items-center justify-between px-6 py-4 border-b border-gray-100 last:border-0"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-sm">
                {m.email?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-sm text-gray-900">{m.email}</p>
                <p className="text-xs text-gray-400 capitalize">{m.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${m.status === "Active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
              >
                {m.status || "Pending"}
              </span>
              <button
                onClick={() => removeMember(m.email)}
                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   BILLING TAB
══════════════════════════════════════════════ */
function BillingTab() {
  const usage = { contacts: 1240, limit: 5000, campaigns: 4, accounts: 2 };
  const usagePct = Math.round((usage.contacts / usage.limit) * 100);
  const plans = [
    {
      name: "Starter",
      price: 29,
      features: ["1 LinkedIn account", "500 contacts/mo", "Basic campaigns"],
      current: false,
    },
    {
      name: "Pro",
      price: 79,
      features: [
        "3 LinkedIn accounts",
        "5,000 contacts/mo",
        "AI personalization",
        "Voice notes",
      ],
      current: true,
    },
    {
      name: "Agency",
      price: 199,
      features: [
        "10 LinkedIn accounts",
        "Unlimited contacts",
        "White label",
        "Priority support",
      ],
      current: false,
    },
  ];

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
      <p className="text-gray-500 mt-1 mb-6">
        Manage your subscription and billing
      </p>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between pb-5 border-b border-gray-100">
          <div>
            <span className="text-xs font-semibold text-violet-600 uppercase tracking-wide">
              Current Plan
            </span>
            <h2 className="text-2xl font-bold text-gray-900 mt-0.5">
              Pro Plan
            </h2>
            <p className="text-sm text-gray-400 mt-1">Renews June 1, 2026</p>
          </div>
          <div className="text-right">
            <span className="text-4xl font-bold text-gray-900">$79</span>
            <span className="text-gray-500 text-sm">/mo</span>
          </div>
        </div>
        <div className="mt-5 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-gray-700">
                Contacts this month
              </span>
              <span className="text-sm text-gray-500">
                {usage.contacts.toLocaleString()} /{" "}
                {usage.limit.toLocaleString()}
              </span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${usagePct > 80 ? "bg-red-500" : usagePct > 60 ? "bg-amber-500" : "bg-violet-500"}`}
                style={{ width: `${usagePct}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {usagePct}% used —{" "}
              {(usage.limit - usage.contacts).toLocaleString()} remaining
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              ["LinkedIn Accounts", `${usage.accounts}/3`],
              ["Active Campaigns", `${usage.campaigns}`],
              ["Days Remaining", "3"],
            ].map(([label, val]) => (
              <div
                key={label}
                className="bg-gray-50 rounded-xl p-4 text-center"
              >
                <p className="text-2xl font-bold text-gray-900">{val}</p>
                <p className="text-xs text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button className="px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 transition">
            Upgrade Plan
          </button>
          <button className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">
            View Invoices
          </button>
          <button className="px-5 py-2.5 border border-red-200 text-red-500 rounded-xl text-sm font-medium hover:bg-red-50 transition ml-auto">
            Cancel Plan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`bg-white rounded-2xl border p-5 shadow-sm relative ${plan.current ? "border-violet-400 ring-2 ring-violet-100" : "border-gray-100"}`}
          >
            {plan.current && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs bg-violet-600 text-white px-3 py-1 rounded-full font-medium">
                Current
              </span>
            )}
            <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              ${plan.price}
              <span className="text-sm font-normal text-gray-400">/mo</span>
            </p>
            <ul className="mt-4 space-y-2">
              {plan.features.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-2 text-xs text-gray-600"
                >
                  <CheckCircle2
                    size={13}
                    className="text-violet-500 flex-shrink-0"
                  />
                  {f}
                </li>
              ))}
            </ul>
            {!plan.current && (
              <button className="mt-5 w-full py-2 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 transition">
                Switch to {plan.name}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   VOICE CLONER TAB
══════════════════════════════════════════════ */
function VoiceTab() {
  const [fileName, setFileName] = useState("");
  const [uploaded, setUploaded] = useState(false);
  const [cloning, setCloning] = useState(false);
  const [cloned, setCloned] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [banner, setBanner] = useState({ type: "" as any, msg: "" });

  const handleFile = (file: File) => {
    if (!file.type.includes("audio")) {
      setBanner({ type: "error", msg: "Please upload an MP3 or WAV file" });
      return;
    }
    setFileName(file.name);
    setUploaded(true);
    setBanner({ type: "success", msg: `${file.name} ready to clone` });
  };

  const startCloning = async () => {
    setCloning(true);
    await new Promise((r) => setTimeout(r, 2500));
    setCloned(true);
    setCloning(false);
    setBanner({
      type: "success",
      msg: "Voice cloned! Use it in campaigns now.",
    });
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Voice Cloner</h1>
      <p className="text-gray-500 mt-1 mb-6">
        Clone your voice for personalized voice note outreach
      </p>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-1">
            Upload Voice Sample
          </h2>
          <p className="text-xs text-gray-500 mb-5">
            30–60 sec clean audio, no background noise
          </p>
          <div
            onClick={() => {
              const i = document.createElement("input");
              i.type = "file";
              i.accept = "audio/*";
              i.onchange = (e: any) =>
                e.target.files?.[0] && handleFile(e.target.files[0]);
              i.click();
            }}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition ${uploaded ? "border-green-300 bg-green-50" : "border-violet-200 hover:border-violet-400 bg-violet-50/40"}`}
          >
            <div className="text-4xl mb-3">{uploaded ? "✅" : "🎤"}</div>
            <p className="text-sm font-medium text-gray-700">
              {uploaded ? fileName : "Click to upload audio"}
            </p>
            <p className="text-xs text-gray-400 mt-1">MP3, WAV up to 20MB</p>
          </div>
          <Banner type={banner.type} msg={banner.msg} />
          <div className="flex gap-2 mt-4">
            <button
              onClick={startCloning}
              disabled={!uploaded || cloning || cloned}
              className="flex-1 py-2.5 bg-black text-white rounded-xl text-sm font-medium disabled:opacity-40 transition flex items-center justify-center gap-2"
            >
              {cloning ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Cloning…
                </>
              ) : cloned ? (
                "✅ Cloned!"
              ) : (
                "Start Cloning"
              )}
            </button>
            {cloned && (
              <button
                onClick={() => {
                  setPlaying(true);
                  setTimeout(() => setPlaying(false), 3000);
                }}
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition flex items-center gap-2"
              >
                {playing ? (
                  <Loader2 size={14} className="animate-spin text-violet-600" />
                ) : (
                  <Play size={14} className="text-violet-600" />
                )}{" "}
                Preview
              </button>
            )}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-5">Clone Status</h2>
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`w-3 h-3 rounded-full ${cloned ? "bg-green-500 animate-pulse" : "bg-gray-300"}`}
            />
            <span
              className={`text-sm font-medium ${cloned ? "text-green-700" : "text-gray-400"}`}
            >
              {cloned ? "Ready to use" : "Not cloned yet"}
            </span>
          </div>
          <div className="space-y-5">
            {[
              ["Voice Quality", "85%", "bg-violet-500", "w-[85%]"],
              ["AI Confidence", "94%", "bg-green-500", "w-[94%]"],
            ].map(([label, val, color, w]) => (
              <div key={label}>
                <div className="flex justify-between mb-1.5">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-xs text-gray-500">{cloned ? val : "—"}</p>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${color} rounded-full transition-all duration-1000 ${cloned ? w : "w-0"}`}
                  />
                </div>
              </div>
            ))}
          </div>
          {cloned && (
            <div className="mt-6 bg-violet-50 border border-violet-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-violet-700 mb-1">
                Ready for campaigns
              </p>
              <p className="text-xs text-violet-600">
                Your cloned voice will be used when sending voice note steps.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   WHITE LABEL TAB
══════════════════════════════════════════════ */
function WhiteLabelTab() {
  const [brand, setBrand] = useState("");
  const [domain, setDomain] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#7c3aed");
  const [logoUrl, setLogoUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState({ type: "" as any, msg: "" });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/settings/whitelabel")
      .then((r) => r.json())
      .then((d) => {
        if (d.brandName) setBrand(d.brandName);
        if (d.domain) setDomain(d.domain);
        if (d.supportEmail) setSupportEmail(d.supportEmail);
        if (d.primaryColor) setPrimaryColor(d.primaryColor);
        if (d.logoUrl) setLogoUrl(d.logoUrl);
      })
      .catch(() => {});
  }, []);

  const handleLogo = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => setLogoUrl(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const save = async () => {
    setSaving(true);
    try {
      await fetch("/api/settings/whitelabel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: brand,
          domain,
          supportEmail,
          primaryColor,
          logoUrl,
        }),
      });
      setBanner({ type: "success", msg: "White label settings saved!" });
    } catch {
      setBanner({ type: "error", msg: "Failed to save." });
    } finally {
      setSaving(false);
      setTimeout(() => setBanner({ type: "", msg: "" }), 3000);
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900">White Label</h1>
      <p className="text-gray-500 mt-1 mb-6">
        Customize your platform branding and domain
      </p>
      <div className="grid grid-cols-[1.4fr_1fr] gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Brand Logo
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              className="mt-1.5 h-20 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:border-violet-400 transition overflow-hidden"
            >
              {logoUrl ? (
                <img src={logoUrl} className="h-full object-contain p-2" />
              ) : (
                <span className="text-xs text-gray-400 flex items-center gap-2">
                  <Upload size={14} />
                  Upload logo
                </span>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                e.target.files?.[0] && handleLogo(e.target.files[0])
              }
            />
          </div>
          {[
            { v: brand, s: setBrand, l: "Brand Name", p: "Your Brand" },
            {
              v: domain,
              s: setDomain,
              l: "Custom Domain",
              p: "app.yourbrand.com",
            },
            {
              v: supportEmail,
              s: setSupportEmail,
              l: "Support Email",
              p: "support@yourbrand.com",
            },
          ].map((f) => (
            <div key={f.l}>
              <label className="text-sm font-medium text-gray-700">{f.l}</label>
              <input
                value={f.v}
                onChange={(e) => f.s(e.target.value)}
                placeholder={f.p}
                className="mt-1.5 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          ))}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Primary Color
            </label>
            <div className="flex items-center gap-3 mt-1.5">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200"
              />
              <input
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>
          <Banner type={banner.type} msg={banner.msg} />
          <button
            onClick={save}
            disabled={saving}
            className="w-full py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Saving…
              </>
            ) : (
              "Save Branding"
            )}
          </button>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Live Preview</h2>
          <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
            <div
              className="p-4 flex items-center gap-3"
              style={{
                background: `linear-gradient(135deg,${primaryColor},${primaryColor}bb)`,
              }}
            >
              {logoUrl ? (
                <img src={logoUrl} className="h-7 w-auto" />
              ) : (
                <div className="w-7 h-7 bg-white/20 rounded-lg" />
              )}
              <span className="text-white font-bold">
                {brand || "Your Brand"}
              </span>
            </div>
            <div className="p-4 bg-gray-50 space-y-3">
              <div className="h-2 bg-gray-200 rounded-full w-3/4" />
              <div className="h-2 bg-gray-200 rounded-full w-1/2" />
              <button
                className="w-full py-2.5 rounded-xl text-white text-sm font-medium"
                style={{ backgroundColor: primaryColor }}
              >
                Launch Campaign
              </button>
            </div>
          </div>
          {domain && (
            <div className="mt-4 bg-gray-50 rounded-xl p-3 text-xs text-gray-500">
              🌐 Live at{" "}
              <span className="font-mono text-violet-600">{domain}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   WEBHOOKS TAB
══════════════════════════════════════════════ */
function WebhooksTab() {
  const [url, setUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [events, setEvents] = useState<string[]>([
    "contact.created",
    "campaign.completed",
  ]);
  const [logs, setLogs] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [banner, setBanner] = useState({ type: "" as any, msg: "" });

  const ALL_EVENTS = [
    "contact.created",
    "contact.replied",
    "contact.connected",
    "campaign.started",
    "campaign.completed",
    "campaign.paused",
    "message.sent",
    "message.failed",
  ];

  useEffect(() => {
    fetch("/api/settings/webhooks")
      .then((r) => r.json())
      .then((d) => {
        if (d.url) setUrl(d.url);
        if (d.secret) setSecret(d.secret);
        if (d.events) setEvents(d.events);
        if (d.logs) setLogs(d.logs);
      })
      .catch(() => {});
  }, []);

  const save = async () => {
    if (!url.startsWith("http")) {
      setBanner({ type: "error", msg: "Enter a valid HTTPS URL" });
      return;
    }
    setSaving(true);
    try {
      await fetch("/api/settings/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, secret, events }),
      });
      setBanner({ type: "success", msg: "Webhook saved!" });
    } catch {
      setBanner({ type: "error", msg: "Failed to save." });
    } finally {
      setSaving(false);
      setTimeout(() => setBanner({ type: "", msg: "" }), 3000);
    }
  };

  const test = async () => {
    if (!url) {
      setBanner({ type: "error", msg: "Save a webhook URL first" });
      return;
    }
    setTesting(true);
    try {
      await fetch("/api/settings/webhooks/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      setBanner({ type: "success", msg: "Test event sent!" });
      setLogs((prev) => [
        { status: "success", event: "test", time: "Just now" },
        ...prev.slice(0, 9),
      ]);
    } catch {
      setBanner({ type: "error", msg: "Test failed." });
      setLogs((prev) => [
        { status: "failed", event: "test", time: "Just now" },
        ...prev.slice(0, 9),
      ]);
    } finally {
      setTesting(false);
      setTimeout(() => setBanner({ type: "", msg: "" }), 3000);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Webhooks</h1>
      <p className="text-gray-500 mt-1 mb-6">
        Receive real-time events for automation
      </p>
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5 mb-6">
        <div>
          <label className="text-sm font-medium text-gray-700">
            Endpoint URL
          </label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://yourapp.com/webhooks/prosp"
            className="mt-1.5 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">
            Signing Secret{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="whsec_..."
            className="mt-1.5 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-3 block">
            Events to receive
          </label>
          <div className="grid grid-cols-2 gap-2">
            {ALL_EVENTS.map((e) => (
              <label
                key={e}
                className="flex items-center gap-2 text-sm cursor-pointer hover:text-violet-700"
              >
                <input
                  type="checkbox"
                  checked={events.includes(e)}
                  onChange={() =>
                    setEvents((prev) =>
                      prev.includes(e)
                        ? prev.filter((x) => x !== e)
                        : [...prev, e],
                    )
                  }
                  className="accent-violet-600"
                />
                <span className="font-mono text-xs">{e}</span>
              </label>
            ))}
          </div>
        </div>
        <Banner type={banner.type} msg={banner.msg} />
        <div className="flex gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Saving…
              </>
            ) : (
              "Save Webhook"
            )}
          </button>
          <button
            onClick={test}
            disabled={testing}
            className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition flex items-center gap-2"
          >
            {testing ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Zap size={14} />
            )}{" "}
            Test
          </button>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Delivery Logs</h2>
          <button
            onClick={() => setLogs([])}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            Clear
          </button>
        </div>
        {logs.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">
            No deliveries yet — send a test event
          </p>
        ) : (
          <div className="space-y-2">
            {logs.map((log, i) => (
              <div
                key={i}
                className="flex items-center justify-between border border-gray-100 rounded-xl p-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${log.status === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                  >
                    {log.status === "success" ? "✓ 200" : "✗ Failed"}
                  </span>
                  <span className="font-mono text-xs text-gray-600">
                    {log.event}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{log.time}</span>
                  {log.status !== "success" && (
                    <button className="text-xs text-violet-600 hover:underline flex items-center gap-1">
                      <RotateCcw size={10} /> Retry
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   INTEGRATIONS TAB
══════════════════════════════════════════════ */
function IntegrationsTab() {
  const [apiKey, setApiKey] = useState(
    "sk_live_x82hsjsj282................................",
  );
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [elevenLabsKey, setElevenLabsKey] = useState("");
  const [savingEl, setSavingEl] = useState(false);
  const [banner, setBanner] = useState({ type: "" as any, msg: "" });

  const copy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const regenerate = async () => {
    if (
      !confirm("Regenerate API key? Existing integrations will stop working.")
    )
      return;
    setRegenerating(true);
    await new Promise((r) => setTimeout(r, 1000));
    setApiKey("sk_live_" + Math.random().toString(36).substring(2, 18) + "...");
    setRegenerating(false);
  };
  const saveElevenLabs = async () => {
    if (!elevenLabsKey) {
      setBanner({ type: "error", msg: "Enter your ElevenLabs API key" });
      return;
    }
    setSavingEl(true);
    try {
      await fetch("/api/settings/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: "elevenlabs", key: elevenLabsKey }),
      });
      setBanner({
        type: "success",
        msg: "ElevenLabs key saved! Voice cloner is now active.",
      });
    } catch {
      setBanner({ type: "error", msg: "Failed to save key." });
    } finally {
      setSavingEl(false);
      setTimeout(() => setBanner({ type: "", msg: "" }), 3000);
    }
  };

  const integrations = [
    {
      name: "Slack",
      desc: "Get campaign notifications in Slack",
      icon: "💬",
      connected: true,
      color: "bg-purple-50",
    },
    {
      name: "HubSpot",
      desc: "Sync leads and contacts automatically",
      icon: "🟠",
      connected: true,
      color: "bg-orange-50",
    },
    {
      name: "Salesforce",
      desc: "Push contacts to your Salesforce CRM",
      icon: "☁️",
      connected: false,
      color: "bg-blue-50",
    },
    {
      name: "Zapier",
      desc: "Connect 5,000+ apps without code",
      icon: "⚡",
      connected: false,
      color: "bg-yellow-50",
    },
    {
      name: "Pipedrive",
      desc: "Auto-create deals from LinkedIn leads",
      icon: "🔵",
      connected: false,
      color: "bg-indigo-50",
    },
  ];

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
      <p className="text-gray-500 mt-1 mb-6">
        Connect your tools and automate workflows
      </p>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl">
            🎙️
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">
              ElevenLabs — Voice Cloner
            </h2>
            <p className="text-xs text-gray-500">
              Required for AI voice note generation in campaigns
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <input
            type="password"
            value={elevenLabsKey}
            onChange={(e) => setElevenLabsKey(e.target.value)}
            placeholder="Your ElevenLabs API key (xi_...)"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <button
            onClick={saveElevenLabs}
            disabled={savingEl}
            className="px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition flex items-center gap-2"
          >
            {savingEl ? <Loader2 size={14} className="animate-spin" /> : null}{" "}
            Save Key
          </button>
        </div>
        <a
          href="https://elevenlabs.io"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-violet-600 hover:underline mt-2 inline-flex items-center gap-1"
        >
          Get ElevenLabs API key <ExternalLink size={10} />
        </a>
        <Banner type={banner.type} msg={banner.msg} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">All Integrations</h2>
        <div className="space-y-3">
          {integrations.map((app) => (
            <div
              key={app.name}
              className="flex items-center justify-between border border-gray-100 rounded-2xl p-4 hover:border-violet-200 transition"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl ${app.color} flex items-center justify-center text-2xl`}
                >
                  {app.icon}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {app.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{app.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${app.connected ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                >
                  {app.connected ? "Connected" : "Not connected"}
                </span>
                <button className="px-4 py-1.5 border border-gray-200 rounded-xl text-xs font-medium hover:border-violet-300 hover:bg-violet-50 transition">
                  {app.connected ? "Configure" : "Connect"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-1">API Access</h2>
        <p className="text-sm text-gray-500 mb-4">
          Use your API key to connect external services
        </p>
        <div className="flex gap-3">
          <input
            value={apiKey}
            readOnly
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono bg-gray-50 text-gray-600"
          />
          <button
            onClick={copy}
            className="px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-700 transition flex items-center gap-2"
          >
            {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <div className="flex gap-3 mt-3">
          <button
            onClick={regenerate}
            disabled={regenerating}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition flex items-center gap-2 disabled:opacity-50"
          >
            {regenerating ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <RefreshCw size={13} />
            )}{" "}
            Regenerate
          </button>
          <a
            href="#"
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition flex items-center gap-2"
          >
            <Code2 size={13} /> API Docs
          </a>
        </div>
      </div>
    </div>
  );
}
