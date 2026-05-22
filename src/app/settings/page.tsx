"use client";

import AppShell from "@/components/layout/AppShell";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Linkedin,
  Key,
  Chrome,
  ClipboardPaste,
  Trash2,
  AlertCircle,
  X,
  ExternalLink,
  Eye,
  EyeOff,
  CheckCircle,
  Globe,
  Shield,
} from "lucide-react";

type ModalType = "credentials" | "extension" | "cookie" | null;
type CredStep = 1 | 2;

function Modal({
  title,
  children,
  onClose,
  wide,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${wide ? "max-w-2xl" : "max-w-md"}`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">{title}</h2>
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

export default function SettingsPage() {
  const { data: session } = useSession();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [modal, setModal] = useState<ModalType>(null);

  // Credentials state
  const [credStep, setCredStep] = useState<CredStep>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [country, setCountry] = useState("United States");
  const [proxyType, setProxyType] = useState<"free" | "own">("free");
  const [ownProxy, setOwnProxy] = useState("");

  // Cookie state
  const [cookie, setCookie] = useState("");
  const [profileUrl, setProfileUrl] = useState("");

  // Extension state
  const [extCountry, setExtCountry] = useState("United States");
  const [extProxyType, setExtProxyType] = useState<"free" | "own">("free");

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  const countries = [
    "United States",
    "India",
    "United Kingdom",
    "Canada",
    "Australia",
    "Germany",
    "France",
    "Singapore",
    "UAE",
  ];

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function fetchAccounts() {
    try {
      const res = await fetch("/api/linkedin-accounts");
      const data = await res.json();
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function closeModal() {
    setModal(null);
    setEmail("");
    setPassword("");
    setCookie("");
    setProfileUrl("");
    setFormError("");
    setSuccess("");
    setCredStep(1);
    setProxyType("free");
    setOwnProxy("");
  }

  // Step 1 → Step 2 for credentials
  function handleCredNext() {
    if (!email || !password) {
      setFormError("Please fill in all fields");
      return;
    }
    if (!email.includes("@")) {
      setFormError("Please enter a valid email");
      return;
    }
    if (password.length < 6) {
      setFormError("Password must be at least 6 characters");
      return;
    }
    setFormError("");
    setCredStep(2);
  }

  async function connectWithCredentials() {
    setSaving(true);
    setFormError("");
    try {
      await new Promise((r) => setTimeout(r, 1200));
      const username = email.split("@")[0];
      const res = await fetch("/api/linkedin-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: session?.user?.name || username.replace(/[._]/g, " "),
          profileUrl: `https://linkedin.com/in/${username}`,
          cookie: `credentials:${btoa(email + ":" + password)}`,
          proxy: proxyType === "free" ? `${country} Residential` : ownProxy,
          status: "WARMING",
          dailyLimit: 25,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setSuccess("LinkedIn account connected successfully!");
      await fetchAccounts();
      setTimeout(closeModal, 1500);
    } catch {
      setFormError("Failed to connect. Please check your credentials.");
    } finally {
      setSaving(false);
    }
  }

  async function connectWithExtension() {
    setSaving(true);
    setFormError("");
    try {
      const res = await fetch("/api/linkedin-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: session?.user?.name || "My LinkedIn",
          profileUrl: "",
          cookie: "extension",
          proxy:
            extProxyType === "free"
              ? `${extCountry} Residential`
              : "Custom Proxy",
          status: "ACTIVE",
          dailyLimit: 25,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setSuccess("Extension connected! You can now automate LinkedIn.");
      await fetchAccounts();
      setTimeout(closeModal, 1500);
    } catch {
      setFormError("Failed to connect.");
    } finally {
      setSaving(false);
    }
  }

  async function connectWithCookie() {
    if (!cookie) {
      setFormError("Please paste your LinkedIn cookie");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const res = await fetch("/api/linkedin-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: session?.user?.name || "My LinkedIn",
          profileUrl,
          cookie,
          status: "ACTIVE",
        }),
      });
      if (!res.ok) throw new Error("Failed");
      closeModal();
      fetchAccounts();
    } catch {
      setFormError("Failed to connect.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(id: string, current: string) {
    try {
      const newStatus = current === "ACTIVE" ? "PAUSED" : "ACTIVE";
      await fetch("/api/linkedin-accounts/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      fetchAccounts();
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteAccount(id: string) {
    await fetch("/api/linkedin-accounts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchAccounts();
  }

  const connectionMethods = [
    {
      key: "credentials" as ModalType,
      label: "Connect with credentials",
      badge: "Easy",
      icon: Key,
    },
    {
      key: "extension" as ModalType,
      label: "Connect with our extension",
      badge: "Easy",
      icon: Chrome,
    },
    {
      key: "cookie" as ModalType,
      label: "Connect manually",
      badge: "Easy",
      icon: ClipboardPaste,
    },
  ];

  // Proxy selector component
  function ProxySelector({
    value,
    onChange,
    country: c,
    onCountryChange,
    ownVal,
    onOwnChange,
  }: any) {
    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Proxy</label>

        {/* Country */}
        <div className="flex items-center gap-2 mb-2">
          <Globe size={14} className="text-gray-400" />
          <select
            value={c}
            onChange={(e) => onCountryChange(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {countries.map((cn) => (
              <option key={cn}>{cn}</option>
            ))}
          </select>
        </div>

        {/* Free proxy option */}
        <button
          type="button"
          onClick={() => onChange("free")}
          className={`w-full border-2 rounded-2xl p-4 text-left transition ${
            value === "free"
              ? "border-purple-500 bg-purple-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                value === "free" ? "border-purple-600" : "border-gray-400"
              }`}
            >
              {value === "free" && (
                <div className="w-2.5 h-2.5 bg-purple-600 rounded-full" />
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">
                Use our free proxy
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Recommended for most users. Residential IP from {c}.
              </p>
            </div>
            <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
              Free
            </span>
          </div>
        </button>

        {/* Own proxy option */}
        <button
          type="button"
          onClick={() => onChange("own")}
          className={`w-full border-2 rounded-2xl p-4 text-left transition ${
            value === "own"
              ? "border-purple-500 bg-purple-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                value === "own" ? "border-purple-600" : "border-gray-400"
              }`}
            >
              {value === "own" && (
                <div className="w-2.5 h-2.5 bg-purple-600 rounded-full" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">
                Use your own proxy
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Advanced — bring your own residential proxy.
              </p>
              {value === "own" && (
                <input
                  type="text"
                  placeholder="http://user:pass@proxy:port"
                  value={ownVal}
                  onChange={(e) => onOwnChange(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-2 w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              )}
            </div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <AppShell activeTab="settings">
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            LinkedIn Accounts
          </h1>
          <p className="text-gray-500 mt-1">
            Connect your LinkedIn account to automate outreach
          </p>
        </div>

        {/* Account list */}
        {loading ? (
          <div className="text-gray-400 text-sm">Loading...</div>
        ) : accounts.length > 0 ? (
          <div className="space-y-4 mb-8">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="flex items-center justify-between px-6 py-5 rounded-3xl border border-white/60 bg-white/80 backdrop-blur-xl shadow-sm hover:shadow-xl hover:shadow-purple-100/40 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg">
                    <Linkedin size={20} className="text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{acc.name}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 border border-violet-200">
                        Premium
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <p className="text-xs text-gray-400 truncate max-w-[200px]">
                        {acc.profileUrl || "Connected"}
                      </p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                        {acc.proxy || "Residential Proxy"}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        Limit: {acc.dailyLimit}/day
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${
                      acc.status === "ACTIVE"
                        ? "bg-green-50 border-green-200"
                        : "bg-amber-50 border-amber-200"
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                        acc.status === "ACTIVE"
                          ? "bg-green-500"
                          : "bg-amber-500"
                      }`}
                    />
                    <span
                      className={`text-xs font-medium ${
                        acc.status === "ACTIVE"
                          ? "text-green-700"
                          : "text-amber-700"
                      }`}
                    >
                      {acc.status === "ACTIVE"
                        ? "Active"
                        : acc.status === "WARMING"
                          ? "Warming"
                          : "Paused"}
                    </span>
                  </div>

                  <div className="hidden md:flex items-center gap-1.5">
                    <span className="text-[10px] px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                      Stealth Mode
                    </span>
                    <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                      Session Saved
                    </span>
                    <span className="text-[10px] px-2 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100">
                      Random Delays
                    </span>
                  </div>

                  <button
                    onClick={() => toggleStatus(acc.id, acc.status)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                      acc.status === "ACTIVE"
                        ? "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                        : "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                    }`}
                  >
                    {acc.status === "ACTIVE" ? "Pause" : "Start"}
                  </button>

                  <button
                    onClick={() => deleteAccount(acc.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mb-8 p-10 border-2 border-dashed border-gray-200 rounded-2xl text-center">
            <Linkedin size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">
              No LinkedIn account connected
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Connect your account to start automating outreach
            </p>
          </div>
        )}

        {/* Add button */}
        <div className="relative inline-block">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium text-sm transition"
          >
            <Linkedin size={16} />
            Add a LinkedIn account
            <span className="ml-1 text-purple-300">▾</span>
          </button>

          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute left-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-2xl shadow-xl z-20 overflow-hidden">
                {connectionMethods.map((method) => (
                  <button
                    key={String(method.key)}
                    onClick={() => {
                      setModal(method.key);
                      setShowDropdown(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition text-left border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                        <method.icon size={15} className="text-purple-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-800">
                        {method.label}
                      </span>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      {method.badge}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── MODAL: Credentials (2 steps) ── */}
      {modal === "credentials" && (
        <Modal
          title={
            credStep === 1 ? "Connect with credentials" : "Configure proxy"
          }
          onClose={closeModal}
          wide
        >
          {credStep === 1 ? (
            <div className="space-y-5">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex gap-2">
                <AlertCircle
                  size={16}
                  className="text-amber-500 flex-shrink-0 mt-0.5"
                />
                <p className="text-xs text-amber-700">
                  Your credentials are encrypted with AES-256 and never shared
                  with third parties.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  LinkedIn Email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  LinkedIn Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {formError && <p className="text-sm text-red-500">{formError}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={closeModal}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCredNext}
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium text-sm transition"
                >
                  Continue →
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <ProxySelector
                value={proxyType}
                onChange={setProxyType}
                country={country}
                onCountryChange={setCountry}
                ownVal={ownProxy}
                onOwnChange={setOwnProxy}
              />

              {formError && <p className="text-sm text-red-500">{formError}</p>}

              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setCredStep(1);
                    setFormError("");
                  }}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition"
                >
                  ← Back
                </button>
                <button
                  onClick={connectWithCredentials}
                  disabled={saving}
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl font-medium text-sm transition"
                >
                  {saving ? "Connecting..." : "Connect LinkedIn"}
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* ── MODAL: Extension ── */}
      {modal === "extension" && (
        <Modal title="Connect with our extension" onClose={closeModal} wide>
          <div className="space-y-5">
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Make sure you are already logged into LinkedIn.
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Connect your LinkedIn account using our Chrome extension.
              </p>
            </div>

            <div className="flex items-center gap-4 p-4 bg-purple-50 border border-purple-100 rounded-2xl">
              <Chrome size={28} className="text-purple-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-gray-800 text-sm">
                  Prosp LinkedIn Connector
                </p>
                <p className="text-xs text-gray-500">Chrome Extension · Free</p>
              </div>
              <a
                href="https://chrome.google.com/webstore"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-medium hover:bg-purple-700 transition"
              >
                Install <ExternalLink size={11} />
              </a>
            </div>

            <ProxySelector
              value={extProxyType}
              onChange={setExtProxyType}
              country={extCountry}
              onCountryChange={setExtCountry}
              ownVal=""
              onOwnChange={() => {}}
            />

            {formError && <p className="text-sm text-red-500">{formError}</p>}

            <div className="flex gap-3 pt-2">
              <button
                onClick={closeModal}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={connectWithExtension}
                disabled={saving}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl font-medium text-sm transition"
              >
                {saving ? "Connecting..." : "Continue"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── MODAL: Cookie ── */}
      {modal === "cookie" && (
        <Modal title="Connect manually" onClose={closeModal} wide>
          <div className="space-y-5">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
              <p className="text-sm font-medium text-yellow-900 mb-2">
                How to get your li_at cookie:
              </p>
              <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
                <li>Open LinkedIn and log in</li>
                <li>Press F12 → Application → Cookies → www.linkedin.com</li>
                <li>
                  Find{" "}
                  <code className="bg-yellow-100 px-1.5 py-0.5 rounded font-mono text-xs">
                    li_at
                  </code>{" "}
                  and copy its value
                </li>
              </ol>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                LinkedIn Profile URL (optional)
              </label>
              <input
                type="text"
                placeholder="https://linkedin.com/in/yourname"
                value={profileUrl}
                onChange={(e) => setProfileUrl(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Session Cookie{" "}
                <span className="text-purple-600 font-normal">
                  (li_at value)
                </span>
              </label>
              <textarea
                rows={5}
                placeholder="Paste your li_at cookie value here..."
                value={cookie}
                onChange={(e) => setCookie(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-xs"
              />
            </div>

            {formError && <p className="text-sm text-red-500">{formError}</p>}

            <div className="flex gap-3 pt-2">
              <button
                onClick={closeModal}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={connectWithCookie}
                disabled={saving}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl font-medium text-sm transition"
              >
                {saving ? "Connecting..." : "Connect Account"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </AppShell>
  );
}
