"use client";
// src/components/settings/AccountsTab.tsx
// Drop-in replacement for the AccountsTab inside settings/page.tsx
// Or use as a standalone component

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Chrome,
  Key,
  ClipboardPaste,
  Trash2,
  X,
  ExternalLink,
  Eye,
  EyeOff,
  Globe,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  AlertTriangle,
  Activity,
  RotateCcw,
  TrendingUp,
  Clock,
  Shield,
  Wifi,
  WifiOff,
  RefreshCw,
} from "lucide-react";

const COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Singapore",
  "UAE",
];

/* ─── tiny helpers ─── */
function Modal({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${wide ? "max-w-xl" : "max-w-md"} max-h-[92vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="font-semibold text-gray-900 text-base">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function Alert({
  type,
  msg,
}: {
  type: "success" | "error" | "warning" | "info" | "";
  msg: string;
}) {
  if (!msg) return null;
  const s: Record<string, string> = {
    success: "bg-green-50 text-green-700 border-green-200",
    error: "bg-red-50   text-red-600   border-red-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    info: "bg-blue-50  text-blue-700  border-blue-200",
  };
  const icons: Record<string, React.ReactNode> = {
    success: <CheckCircle2 size={15} className="flex-shrink-0" />,
    error: <AlertCircle size={15} className="flex-shrink-0" />,
    warning: <AlertTriangle size={15} className="flex-shrink-0" />,
    info: <AlertCircle size={15} className="flex-shrink-0" />,
  };
  return (
    <div
      className={`flex items-start gap-2 px-4 py-3 rounded-xl text-sm border ${s[type]}`}
    >
      {icons[type]}
      <span>{msg}</span>
    </div>
  );
}

function ProxyPicker({ country, onCountry, type, onType, own, onOwn }: any) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700">Proxy</label>
      <div className="flex items-center gap-2">
        <Globe size={14} className="text-gray-400 flex-shrink-0" />
        <select
          value={country}
          onChange={(e) => onCountry(e.target.value)}
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          {COUNTRIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      {[
        {
          v: "free",
          title: "Free residential proxy",
          sub: "Recommended — shared residential IP",
          badge: "Free",
        },
        {
          v: "own",
          title: "Use your own proxy",
          sub: "Advanced — your residential proxy",
        },
      ].map((o) => (
        <button
          key={o.v}
          type="button"
          onClick={() => onType(o.v)}
          className={`w-full border-2 rounded-2xl p-4 text-left transition-all ${type === o.v ? "border-violet-500 bg-violet-50" : "border-gray-200 hover:border-gray-300"}`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${type === o.v ? "border-violet-600" : "border-gray-300"}`}
            >
              {type === o.v && (
                <div className="w-2.5 h-2.5 bg-violet-600 rounded-full" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm">{o.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{o.sub}</p>
              {o.v === "own" && type === "own" && (
                <input
                  type="text"
                  placeholder="http://user:pass@host:port"
                  value={own}
                  onChange={(e) => onOwn(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-2 w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              )}
            </div>
            {o.badge && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium ml-auto">
                {o.badge}
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════ */
export default function AccountsTab() {
  const { data: session } = useSession();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<
    "extension" | "credentials" | "cookie" | "reconnect" | null
  >(null);
  const [reconnectAcc, setReconnectAcc] = useState<any>(null);

  // Shared form state
  const [country, setCountry] = useState("India");
  const [proxyType, setProxyType] = useState<"free" | "own">("free");
  const [ownProxy, setOwnProxy] = useState("");

  // Credentials state
  const [credStep, setCredStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  // Cookie state
  const [cookie, setCookie] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState<any>(null); // {name, profileUrl, avatar}

  // Reconnect
  const [newCookie, setNewCookie] = useState("");

  // Extension
  const [extDetected, setExtDetected] = useState<boolean | null>(null);
  const [extChecking, setExtChecking] = useState(false);

  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ type: "" as any, msg: "" });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const res = await fetch("/api/linkedin-accounts");
      const data = await res.json();
      setAccounts(Array.isArray(data) ? data : []);
    } catch {
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type: any, msg: string, ms = 4000) => {
    setAlert({ type, msg });
    if (ms) setTimeout(() => setAlert({ type: "", msg: "" }), ms);
  };

  const closeModal = () => {
    setModal(null);
    setAlert({ type: "", msg: "" });
    setEmail("");
    setPassword("");
    setCookie("");
    setProfileUrl("");
    setCredStep(1);
    setProxyType("free");
    setOwnProxy("");
    setVerified(null);
    setVerifying(false);
    setNewCookie("");
    setReconnectAcc(null);
    setExtDetected(null);
  };

  const proxyString = () =>
    proxyType === "free" ? `${country} Residential` : ownProxy;

  const saveAccount = async (payload: any) => {
    setSaving(true);
    try {
      const res = await fetch("/api/linkedin-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed");
      showAlert("success", "LinkedIn account connected successfully!");
      await loadAccounts();
      setTimeout(closeModal, 1500);
    } catch {
      showAlert("error", "Failed to connect account. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  /* ─── EXTENSION: ping extension to check if installed ─── */
  const checkExtension = () => {
    setExtChecking(true);
    setExtDetected(null);
    // Ping via window.postMessage — bridge.js responds
    const timeout = setTimeout(() => {
      setExtDetected(false);
      setExtChecking(false);
    }, 3000);
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "PROSP_EXTENSION_PONG") {
        clearTimeout(timeout);
        window.removeEventListener("message", handler);
        setExtDetected(true);
        setExtChecking(false);
      }
    };
    window.addEventListener("message", handler);
    window.postMessage({ type: "PROSP_EXTENSION_PING" }, "*");
  };

  const connectExtension = () => {
    saveAccount({
      name: session?.user?.name || "My LinkedIn",
      profileUrl: "",
      cookie: "extension",
      proxy: proxyString(),
      status: "ACTIVE",
      dailyLimit: 25,
    });
  };

  /* ─── CREDENTIALS: step 2 connect ─── */
  const connectCredentials = () => {
    if (!email || !password) {
      showAlert("error", "Please fill in all fields");
      return;
    }
    if (!email.includes("@")) {
      showAlert("error", "Enter a valid email address");
      return;
    }
    if (password.length < 6) {
      showAlert("error", "Password must be at least 6 characters");
      return;
    }
    saveAccount({
      name: session?.user?.name || email.split("@")[0],
      profileUrl: `https://www.linkedin.com/in/${email.split("@")[0]}/`,
      cookie: `credentials:${btoa(`${email}:${password}`)}`,
      proxy: proxyString(),
      status: "WARMING", // starts warm-up
      dailyLimit: 5, // starts at 5/day, increases over 14 days
    });
  };

  /* ─── COOKIE: verify then connect ─── */
  const verifyCookie = async () => {
    if (!cookie.trim()) {
      showAlert("error", "Paste your li_at cookie first");
      return;
    }
    setVerifying(true);
    setVerified(null);
    try {
      const res = await fetch("/api/linkedin-accounts/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cookie: cookie.trim() }),
      });
      const data = await res.json();
      if (data.valid) {
        setVerified(data);
        if (data.unverified) {
          showAlert(
            "warning",
            "Could not verify automatically — you can still connect",
            0,
          );
        } else {
          showAlert(
            "success",
            `✅ Cookie valid! Found account: ${data.name}`,
            0,
          );
          if (data.profileUrl) setProfileUrl(data.profileUrl);
        }
      } else {
        showAlert(
          "error",
          data.error ||
            "Cookie is invalid or expired. Get a fresh one from LinkedIn.",
        );
      }
    } catch {
      showAlert("error", "Verification failed. You can still try connecting.");
      setVerified({ unverified: true, name: "LinkedIn User", profileUrl: "" });
    } finally {
      setVerifying(false);
    }
  };

  const connectCookie = () => {
    if (!cookie.trim()) {
      showAlert("error", "Paste your li_at cookie first");
      return;
    }
    saveAccount({
      name: verified?.name || session?.user?.name || "My LinkedIn",
      profileUrl: profileUrl || verified?.profileUrl || "",
      avatar: verified?.avatar || "",
      cookie: cookie.trim(),
      proxy: proxyString(),
      status: "ACTIVE",
      dailyLimit: 25,
    });
  };

  /* ─── RECONNECT ─── */
  const reconnect = async () => {
    if (!newCookie.trim()) {
      showAlert("error", "Paste your new li_at cookie");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(
        `/api/linkedin-accounts/${reconnectAcc.id}/reconnect`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cookie: newCookie.trim() }),
        },
      );
      if (!res.ok) throw new Error();
      showAlert("success", "Account reconnected successfully!");
      await loadAccounts();
      setTimeout(closeModal, 1500);
    } catch {
      showAlert("error", "Reconnect failed. Try again.");
    } finally {
      setSaving(false);
    }
  };

  /* ─── Account actions ─── */
  const toggleStatus = async (id: string, current: string) => {
    await fetch("/api/linkedin-accounts/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        status: current === "ACTIVE" ? "PAUSED" : "ACTIVE",
      }),
    });
    loadAccounts();
  };

  const deleteAccount = async (id: string) => {
    if (!confirm("Remove this LinkedIn account?")) return;
    await fetch("/api/linkedin-accounts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadAccounts();
  };

  const warmupProgress = (createdAt: string) => {
    const days = Math.min(
      14,
      Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000),
    );
    return {
      days,
      limit: Math.round(5 + (days / 14) * 20),
      pct: Math.round((days / 14) * 100),
    };
  };

  const STATUS_STYLE: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700",
    PAUSED: "bg-yellow-100 text-yellow-700",
    BLOCKED: "bg-red-100 text-red-700",
    WARMING: "bg-blue-100 text-blue-700",
  };

  /* ════════════════════════════════════════
     RENDER
  ════════════════════════════════════════ */
  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            LinkedIn Accounts
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Connect and manage your LinkedIn accounts
          </p>
        </div>
        <div className="flex items-center gap-2">
          {[
            { key: "extension" as const, label: "Extension", Icon: Chrome },
            { key: "credentials" as const, label: "Credentials", Icon: Key },
            { key: "cookie" as const, label: "Cookie", Icon: ClipboardPaste },
          ].map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setModal(key)}
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-sm hover:border-violet-300 hover:bg-violet-50 transition-all"
            >
              <Icon size={14} className="text-violet-600" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Account list */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 size={20} className="animate-spin mr-2" /> Loading accounts…
        </div>
      ) : accounts.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-2xl py-20 text-center">
          <div className="text-5xl mb-4">💼</div>
          <p className="font-semibold text-gray-600">
            No accounts connected yet
          </p>
          <p className="text-sm text-gray-400 mt-1 mb-6">
            Connect a LinkedIn account to start automating outreach
          </p>
          <div className="flex items-center justify-center gap-3">
            {[
              { key: "extension" as const, label: "+ Extension", Icon: Chrome },
              {
                key: "credentials" as const,
                label: "+ Credentials",
                Icon: Key,
              },
              {
                key: "cookie" as const,
                label: "+ Cookie",
                Icon: ClipboardPaste,
              },
            ].map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setModal(key)}
                className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:border-violet-300 hover:bg-violet-50 transition-all"
              >
                <Icon size={15} className="text-violet-600" />
                {label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {accounts.map((acc) => {
            const expired = acc.status === "BLOCKED";
            const warming = acc.status === "WARMING";
            const wp = warmupProgress(
              acc.createdAt || new Date().toISOString(),
            );
            return (
              <div
                key={acc.id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${expired ? "border-red-300" : "border-gray-100"}`}
              >
                {/* Expired banner */}
                {expired && (
                  <div className="bg-red-50 border-b border-red-200 px-5 py-2.5 flex items-center justify-between">
                    <span className="text-sm text-red-600 font-medium flex items-center gap-2">
                      <AlertTriangle size={14} /> Cookie expired — reconnect to
                      resume
                    </span>
                    <button
                      onClick={() => {
                        setReconnectAcc(acc);
                        setModal("reconnect");
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition"
                    >
                      <RotateCcw size={11} /> Reconnect
                    </button>
                  </div>
                )}

                <div className="p-5">
                  {/* Top */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 overflow-hidden">
                        {acc.avatar ? (
                          <img
                            src={acc.avatar}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          acc.name?.[0]?.toUpperCase() || "L"
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900">
                            {acc.name}
                          </p>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[acc.status] || "bg-gray-100 text-gray-500"}`}
                          >
                            {acc.status}
                          </span>
                          {acc.cookie === "extension" && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 font-medium flex items-center gap-1">
                              <Chrome size={10} /> Extension
                            </span>
                          )}
                        </div>
                        {acc.profileUrl && (
                          <a
                            href={acc.profileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-blue-500 hover:underline mt-0.5 block"
                          >
                            {acc.profileUrl}
                          </a>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-xs flex items-center gap-1 ${expired ? "text-red-400" : "text-green-600"}`}
                          >
                            {expired ? (
                              <WifiOff size={11} />
                            ) : (
                              <Wifi size={11} />
                            )}
                            {acc.proxy || "No proxy"}
                            {!expired && " ✓"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!expired && (
                        <button
                          onClick={() => toggleStatus(acc.id, acc.status)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${acc.status === "ACTIVE" ? "border-yellow-200 text-yellow-700 hover:bg-yellow-50" : "border-green-200 text-green-700 hover:bg-green-50"}`}
                        >
                          {acc.status === "ACTIVE" ? "Pause" : "Resume"}
                        </button>
                      )}
                      {expired && (
                        <button
                          onClick={() => {
                            setReconnectAcc(acc);
                            setModal("reconnect");
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-medium border border-red-200 text-red-600 hover:bg-red-50 transition flex items-center gap-1"
                        >
                          <RotateCcw size={11} /> Reconnect
                        </button>
                      )}
                      <button
                        onClick={() => deleteAccount(acc.id)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {[
                      {
                        label: "Sent Today",
                        value: `${acc.sentToday ?? 0}/${acc.dailyLimit ?? 25}`,
                        Icon: Activity,
                      },
                      {
                        label: "Pending",
                        value: acc.pendingCount ?? "—",
                        Icon: Clock,
                      },
                      {
                        label: "Accept Rate",
                        value: acc.acceptRate ? `${acc.acceptRate}%` : "—",
                        Icon: TrendingUp,
                      },
                      {
                        label: "Reply Rate",
                        value: acc.replyRate ? `${acc.replyRate}%` : "—",
                        Icon: Shield,
                      },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="bg-gray-50 rounded-xl p-3 text-center"
                      >
                        <s.Icon
                          size={13}
                          className="text-gray-400 mx-auto mb-1"
                        />
                        <p className="text-base font-bold text-gray-900">
                          {s.value}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {s.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Warm-up bar */}
                  {warming && (
                    <div className="border border-blue-100 bg-blue-50/60 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-blue-700 flex items-center gap-1">
                          <TrendingUp size={11} /> Warm-up in progress
                        </span>
                        <span className="text-xs text-blue-500">
                          Day {wp.days}/14 · {wp.limit} sends/day
                        </span>
                      </div>
                      <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: `${wp.pct}%` }}
                        />
                      </div>
                      <p className="text-xs text-blue-400 mt-1">
                        Automatically reaches 25/day after 14 days
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════
          MODAL: Extension
      ══════════════════════════════════════ */}
      {modal === "extension" && (
        <Modal title="Connect with extension" onClose={closeModal} wide>
          <div className="space-y-5">
            {/* Step 1 — install banner */}
            <div className="border border-gray-200 rounded-2xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Chrome size={24} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    Prosp LinkedIn Connector
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Chrome Extension — connects your active LinkedIn session
                  </p>
                  <a
                    href="https://chrome.google.com/webstore"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2 text-xs font-medium text-blue-600 hover:underline"
                  >
                    <ExternalLink size={11} /> Install from Chrome Web Store
                  </a>
                </div>
              </div>
            </div>

            {/* Step 2 — detect extension */}
            <div className="border border-gray-200 rounded-2xl p-5">
              <p className="text-sm font-semibold text-gray-900 mb-3">
                Step 1 — Detect extension
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={checkExtension}
                  disabled={extChecking}
                  className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition"
                >
                  {extChecking ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Detecting…
                    </>
                  ) : (
                    <>
                      <RefreshCw size={14} />
                      Detect Extension
                    </>
                  )}
                </button>
                {extDetected === true && (
                  <span className="text-sm text-green-600 flex items-center gap-1.5">
                    <CheckCircle2 size={15} />
                    Extension detected!
                  </span>
                )}
                {extDetected === false && (
                  <span className="text-sm text-red-500 flex items-center gap-1.5">
                    <AlertCircle size={15} />
                    Not found — make sure it's installed and enabled
                  </span>
                )}
              </div>
            </div>

            {/* Step 3 — LinkedIn must be open */}
            <div className="border border-amber-200 bg-amber-50 rounded-2xl p-4 text-sm text-amber-800">
              <p className="font-semibold mb-1">Step 2 — Log in to LinkedIn</p>
              <p>
                Make sure you are <strong>already logged in</strong> to LinkedIn
                in this browser before connecting.
              </p>
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-amber-700 underline"
              >
                Open LinkedIn <ExternalLink size={10} />
              </a>
            </div>

            <ProxyPicker
              country={country}
              onCountry={setCountry}
              type={proxyType}
              onType={setProxyType}
              own={ownProxy}
              onOwn={setOwnProxy}
            />

            <Alert type={alert.type} msg={alert.msg} />

            <div className="flex gap-3 pt-1">
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={connectExtension}
                disabled={saving}
                className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Connecting…
                  </>
                ) : (
                  "Connect Account"
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ══════════════════════════════════════
          MODAL: Credentials
      ══════════════════════════════════════ */}
      {modal === "credentials" && (
        <Modal title="Connect with credentials" onClose={closeModal}>
          <div className="space-y-5">
            {/* Progress steps */}
            <div className="flex items-center gap-2 mb-2">
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${credStep >= s ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-400"}`}
                  >
                    {credStep > s ? <CheckCircle2 size={14} /> : s}
                  </div>
                  <span
                    className={`text-xs font-medium ${credStep >= s ? "text-violet-600" : "text-gray-400"}`}
                  >
                    {s === 1 ? "Login" : "Proxy"}
                  </span>
                  {s < 2 && (
                    <div
                      className={`h-px flex-1 w-8 ${credStep > s ? "bg-violet-400" : "bg-gray-200"}`}
                    />
                  )}
                </div>
              ))}
            </div>

            {credStep === 1 && (
              <>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
                  Your credentials are encrypted and never stored in plain text.
                  We use them only to automate LinkedIn on your behalf.
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    LinkedIn Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="mt-1.5 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    LinkedIn Password
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Your LinkedIn password"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                    <button
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>
                <Alert type={alert.type} msg={alert.msg} />
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={closeModal}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (!email || !password) {
                        showAlert("error", "Please fill in all fields", 3000);
                        return;
                      }
                      if (!email.includes("@")) {
                        showAlert("error", "Enter a valid email", 3000);
                        return;
                      }
                      if (password.length < 6) {
                        showAlert("error", "Password too short", 3000);
                        return;
                      }
                      setAlert({ type: "", msg: "" });
                      setCredStep(2);
                    }}
                    className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition"
                  >
                    Next →
                  </button>
                </div>
              </>
            )}

            {credStep === 2 && (
              <>
                <ProxyPicker
                  country={country}
                  onCountry={setCountry}
                  type={proxyType}
                  onType={setProxyType}
                  own={ownProxy}
                  onOwn={setOwnProxy}
                />
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-600">
                  ℹ️ New accounts start with a <strong>warm-up period</strong>{" "}
                  (5 sends/day, increasing to 25 over 14 days) to avoid LinkedIn
                  restrictions.
                </div>
                <Alert type={alert.type} msg={alert.msg} />
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => {
                      setCredStep(1);
                      setAlert({ type: "", msg: "" });
                    }}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={connectCredentials}
                    disabled={saving}
                    className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Connecting…
                      </>
                    ) : (
                      "Connect Account"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}

      {/* ══════════════════════════════════════
          MODAL: Cookie
      ══════════════════════════════════════ */}
      {modal === "cookie" && (
        <Modal title="Connect with cookie" onClose={closeModal} wide>
          <div className="space-y-5">
            {/* Instructions */}
            <div className="border border-amber-200 bg-amber-50 rounded-2xl p-4">
              <p className="text-sm font-semibold text-amber-900 mb-2">
                How to get your li_at cookie
              </p>
              <ol className="text-sm text-amber-800 space-y-1.5 list-decimal list-inside">
                <li>
                  Open{" "}
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noreferrer"
                    className="underline font-medium"
                  >
                    linkedin.com
                  </a>{" "}
                  and make sure you're logged in
                </li>
                <li>
                  Press{" "}
                  <kbd className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-xs">
                    F12
                  </kbd>{" "}
                  to open DevTools
                </li>
                <li>
                  Go to <strong>Application</strong> → <strong>Cookies</strong>{" "}
                  → <strong>www.linkedin.com</strong>
                </li>
                <li>
                  Find{" "}
                  <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-xs">
                    li_at
                  </code>{" "}
                  and copy the <strong>Value</strong>
                </li>
              </ol>
            </div>

            {/* Cookie input + verify */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-700">
                  li_at Cookie Value
                </label>
                {verified && !verified.unverified && (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Verified
                  </span>
                )}
              </div>
              <div className="relative">
                <textarea
                  rows={3}
                  value={cookie}
                  onChange={(e) => {
                    setCookie(e.target.value);
                    setVerified(null);
                    setAlert({ type: "", msg: "" });
                  }}
                  placeholder="AQEDATxxxxxxxx..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none pr-24"
                />
                <button
                  onClick={verifyCookie}
                  disabled={verifying || !cookie.trim()}
                  className={`absolute right-3 top-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${verified && !verified.unverified ? "bg-green-100 text-green-700" : "bg-violet-100 text-violet-700 hover:bg-violet-200"} disabled:opacity-50`}
                >
                  {verifying ? (
                    <>
                      <Loader2 size={11} className="animate-spin" />
                      Checking…
                    </>
                  ) : verified && !verified.unverified ? (
                    <>
                      <CheckCircle2 size={11} />
                      Verified
                    </>
                  ) : (
                    "Verify"
                  )}
                </button>
              </div>
            </div>

            {/* Profile URL */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                LinkedIn Profile URL{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="url"
                value={profileUrl}
                onChange={(e) => setProfileUrl(e.target.value)}
                placeholder="https://www.linkedin.com/in/yourname/"
                className="mt-1.5 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            {/* Verified account preview */}
            {verified && !verified.unverified && (
              <div className="flex items-center gap-3 border border-green-200 bg-green-50 rounded-xl p-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
                  {verified.avatar ? (
                    <img
                      src={verified.avatar}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    verified.name?.[0]?.toUpperCase()
                  )}
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">
                    {verified.name}
                  </p>
                  <p className="text-xs text-green-600">
                    Cookie verified — ready to connect
                  </p>
                </div>
              </div>
            )}

            <ProxyPicker
              country={country}
              onCountry={setCountry}
              type={proxyType}
              onType={setProxyType}
              own={ownProxy}
              onOwn={setOwnProxy}
            />

            <Alert type={alert.type} msg={alert.msg} />

            <div className="flex gap-3 pt-1">
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={connectCookie}
                disabled={saving || !cookie.trim()}
                className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Connecting…
                  </>
                ) : (
                  "Connect Account"
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ══════════════════════════════════════
          MODAL: Reconnect
      ══════════════════════════════════════ */}
      {modal === "reconnect" && reconnectAcc && (
        <Modal title={`Reconnect — ${reconnectAcc.name}`} onClose={closeModal}>
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
              Your session expired. Get a fresh{" "}
              <code className="bg-red-100 px-1 rounded font-mono">li_at</code>{" "}
              cookie from LinkedIn and paste it below.
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                New li_at Cookie
              </label>
              <textarea
                rows={3}
                value={newCookie}
                onChange={(e) => setNewCookie(e.target.value)}
                placeholder="AQEDATxxxxxxxx..."
                className="mt-1.5 w-full border border-gray-200 rounded-xl px-4 py-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              />
            </div>
            <Alert type={alert.type} msg={alert.msg} />
            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={reconnect}
                disabled={saving}
                className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Reconnecting…
                  </>
                ) : (
                  <>
                    <RotateCcw size={14} />
                    Reconnect
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
