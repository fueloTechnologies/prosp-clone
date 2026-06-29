"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Linkedin,
  Trash2,
  X,
  Eye,
  EyeOff,
  KeyRound,
  Cookie,
  Puzzle,
} from "lucide-react";

interface LinkedInAccount {
  id: string;
  name: string;
  profileUrl?: string;
  proxy?: string;
  dailyLimit: number;
  status: "ACTIVE" | "PAUSED" | "WARMING" | "BLOCKED";
}

interface Props {
  accounts: LinkedInAccount[];
  loading: boolean;
  onRefresh: () => void;
}

type ModalType = "credentials" | "manual" | null;

// ─── Modal: Connect with Credentials ────────────────────────────────────────
function CredentialsModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!email || !password)
      return setError("Email and password are required.");
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/linkedin-accounts/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: "credentials", email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Connection failed");
      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalShell
      onClose={onClose}
      title="Connect with credentials"
      icon={<KeyRound size={18} className="text-purple-600" />}
    >
      <p className="text-sm text-gray-500 mb-5">
        Enter your LinkedIn login details. We use these only to connect your
        account — your credentials are encrypted.
      </p>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            LinkedIn Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>
      </div>
      {error && (
        <p className="mt-3 text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}
      <div className="mt-5 flex gap-2 justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-5 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition disabled:opacity-50"
        >
          {loading ? "Connecting..." : "Connect"}
        </button>
      </div>
    </ModalShell>
  );
}

// ─── Modal: Connect Manually (Cookie) ────────────────────────────────────────
function ManualModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [cookie, setCookie] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!cookie.trim()) return setError("Session cookie is required.");
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/linkedin-accounts/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: "manual",
          cookie,
          name: name || "My LinkedIn Account",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to connect");
      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalShell
      onClose={onClose}
      title="Connect manually"
      icon={<Cookie size={18} className="text-purple-600" />}
    >
      <p className="text-sm text-gray-500 mb-4">
        Paste your LinkedIn{" "}
        <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">li_at</code>{" "}
        session cookie. You can find this in your browser&apos;s DevTools under
        Application → Cookies → linkedin.com.
      </p>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Account Name <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. My Main LinkedIn"
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            li_at Cookie Value
          </label>
          <textarea
            value={cookie}
            onChange={(e) => setCookie(e.target.value)}
            placeholder="Paste your li_at cookie value here..."
            rows={3}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none font-mono text-xs"
          />
        </div>
      </div>
      {error && (
        <p className="mt-3 text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}
      <div className="mt-4 flex gap-2 justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-5 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition disabled:opacity-50"
        >
          {loading ? "Connecting..." : "Connect"}
        </button>
      </div>
    </ModalShell>
  );
}

// ─── Shared Modal Shell ───────────────────────────────────────────────────────
function ModalShell({
  children,
  onClose,
  title,
  icon,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              {icon}
            </div>
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1 transition"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Connection Method definitions ───────────────────────────────────────────
const CONNECTION_METHODS: {
  key: ModalType | "extension";
  label: string;
  icon: any;
  badge: string;
}[] = [
  {
    key: "credentials",
    label: "Connect with credentials",
    icon: KeyRound,
    badge: "Easy",
  },
  {
    key: "extension",
    label: "Connect with our extension",
    icon: Puzzle,
    badge: "Easy",
  },
  { key: "manual", label: "Connect manually", icon: Cookie, badge: "Easy" },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AccountsSettings({
  accounts,
  loading,
  onRefresh,
}: Props) {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [modal, setModal] = useState<ModalType>(null);

  function handleMethodClick(key: ModalType | "extension") {
    setShowDropdown(false);
    if (key === "extension") {
      // Navigate to the full extension guide page
      router.push("/extension-guide");
    } else {
      setModal(key);
    }
  }

  async function toggleStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";
    await fetch("/api/linkedin-accounts/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    onRefresh();
  }

  async function deleteAccount(id: string) {
    if (!confirm("Remove this LinkedIn account?")) return;
    await fetch("/api/linkedin-accounts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    onRefresh();
  }

  return (
    <>
      {/* Modals */}
      {modal === "credentials" && (
        <CredentialsModal
          onClose={() => setModal(null)}
          onSuccess={onRefresh}
        />
      )}
      {modal === "manual" && (
        <ManualModal onClose={() => setModal(null)} onSuccess={onRefresh} />
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
        <p className="text-gray-500 mt-1">
          Automate LinkedIn actions right from within your workspace.
        </p>
      </div>

      {/* Connect LinkedIn section */}
      <div className="mb-8 p-6 rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Linkedin size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Connect LinkedIn</h2>
              <p className="text-sm text-gray-400">
                Automate LinkedIn actions right from within Prosp.
              </p>
            </div>
          </div>

          {/* Add account dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium text-sm transition"
            >
              + Add a LinkedIn account
              <span className="text-purple-300 text-xs">▾</span>
            </button>

            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-100 rounded-2xl shadow-2xl z-20 overflow-hidden">
                  {CONNECTION_METHODS.map((method) => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={String(method.key)}
                        onClick={() => handleMethodClick(method.key)}
                        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition text-left border-b border-gray-50 last:border-0"
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon size={15} className="text-gray-400" />
                          <span className="text-sm font-medium text-gray-800">
                            {method.label}
                          </span>
                        </div>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          {method.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Account list or empty state */}
        <div className="mt-6">
          {loading ? (
            <div className="text-gray-400 text-sm">Loading...</div>
          ) : accounts.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-gray-100 rounded-xl">
              <Linkedin size={32} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium text-sm">
                No LinkedIn account connected
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Use the button above to connect your account
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="flex items-center justify-between px-5 py-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                      <Linkedin size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900">
                        {acc.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {acc.profileUrl || "Connected"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${
                        acc.status === "ACTIVE"
                          ? "bg-green-50 border-green-200 text-green-700"
                          : "bg-amber-50 border-amber-200 text-amber-700"
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                          acc.status === "ACTIVE"
                            ? "bg-green-500"
                            : "bg-amber-500"
                        }`}
                      />
                      {acc.status === "ACTIVE"
                        ? "Active"
                        : acc.status === "WARMING"
                          ? "Warming"
                          : "Paused"}
                    </div>

                    <button
                      onClick={() => toggleStatus(acc.id, acc.status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                        acc.status === "ACTIVE"
                          ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                          : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                      }`}
                    >
                      {acc.status === "ACTIVE" ? "Pause" : "Start"}
                    </button>

                    <button
                      onClick={() => deleteAccount(acc.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}