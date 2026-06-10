"use client";
// src/components/leads/ImportContactsModal.tsx

import { useState, useRef, useCallback, useEffect } from "react";
import {
  X,
  Upload,
  Search,
  FileText,
  Users,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  List,
  Calendar,
  FileImage,
  Globe,
} from "lucide-react";

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
type Source =
  | "linkedin_search"
  | "sales_navigator"
  | "csv"
  | "lead_finder"
  | "add_from_list"
  | "linkedin_event"
  | "linkedin_post"
  | "linkedin_group"
  | null;

interface ParsedContact {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  linkedInUrl: string;
}

interface Props {
  campaignId: string;
  onClose: () => void;
  onImported?: (count: number) => void;
}

/* ─────────────────────────────────────────
   CSV helpers
───────────────────────────────────────── */
function mapRow(headers: string[], values: string[]): ParsedContact {
  const get = (...keys: string[]) => {
    for (const k of keys) {
      const idx = headers.findIndex((h) => h === k);
      if (idx !== -1) return values[idx]?.trim().replace(/"/g, "") || "";
    }
    return "";
  };
  const fullName = get("name", "full_name", "fullname");
  const parts = fullName.split(" ");
  return {
    firstName: get("first_name", "firstname", "first") || parts[0] || "",
    lastName:
      get("last_name", "lastname", "last") || parts.slice(1).join(" ") || "",
    email: get("email", "email_address", "work_email", "personal_email"),
    phone: get("phone", "phone_number", "mobile", "telephone"),
    company: get("company", "organization", "company_name", "employer"),
    position: get("position", "title", "job_title", "role", "occupation"),
    linkedInUrl: get(
      "linkedin",
      "linkedin_url",
      "linkedin_profile",
      "profile_url",
    ),
  };
}

function parseCSV(text: string): ParsedContact[] {
  const lines = text.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0]
    .split(",")
    .map((h) => h.trim().toLowerCase().replace(/\s+/g, "_").replace(/"/g, ""));
  return lines
    .slice(1)
    .map((line) => {
      const values: string[] = [];
      let current = "";
      let inQuotes = false;
      for (const char of line) {
        if (char === '"') inQuotes = !inQuotes;
        else if (char === "," && !inQuotes) {
          values.push(current);
          current = "";
        } else current += char;
      }
      values.push(current);
      return mapRow(headers, values);
    })
    .filter((c) => c.firstName || c.email);
}

/* ─────────────────────────────────────────
   Source definitions
───────────────────────────────────────── */
const SOURCES = [
  {
    id: "add_from_list" as Source,
    title: "Add from my list",
    description: "Import contacts from your existing lists.",
    icon: List,
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "hover:border-violet-300 hover:bg-violet-50/30",
  },
  {
    id: "linkedin_search" as Source,
    title: "LinkedIn Search",
    description: "Import leads from any LinkedIn search URL",
    icon: Search,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "hover:border-blue-300 hover:bg-blue-50/30",
  },
  {
    id: "sales_navigator" as Source,
    title: "Sales Navigator",
    description: "Paste your Sales Navigator search URL",
    icon: Users,
    color: "text-cyan-600",
    bg: "bg-cyan-50",
    border: "hover:border-cyan-300 hover:bg-cyan-50/30",
  },
  {
    id: "lead_finder" as Source,
    title: "Lead finder",
    description: "Search with filters and keywords, based on LinkedIn",
    icon: Globe,
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "hover:border-orange-300 hover:bg-orange-50/30",
  },
  {
    id: "csv" as Source,
    title: "Import from CSV",
    description: "Import your CSV file of LinkedIn profiles",
    icon: Upload,
    color: "text-green-600",
    bg: "bg-green-50",
    border: "hover:border-green-300 hover:bg-green-50/30",
  },
  {
    id: "linkedin_event" as Source,
    title: "LinkedIn Event",
    description: "Import leads attending an event",
    icon: Calendar,
    color: "text-pink-600",
    bg: "bg-pink-50",
    border: "hover:border-pink-300 hover:bg-pink-50/30",
  },
  {
    id: "linkedin_post" as Source,
    title: "LinkedIn Post",
    description: "Import comments or likes of a post",
    icon: FileImage,
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    border: "hover:border-yellow-300 hover:bg-yellow-50/30",
  },
  {
    id: "linkedin_group" as Source,
    title: "LinkedIn Group",
    description: "Import leads from LinkedIn groups",
    icon: FileText,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "hover:border-indigo-300 hover:bg-indigo-50/30",
  },
];

/* ─────────────────────────────────────────
   Main component
───────────────────────────────────────── */
export default function ImportContactsModal({
  campaignId,
  onClose,
  onImported,
}: Props) {
  const [activeSource, setActiveSource] = useState<Source>(null);
  const activeSourceDef = SOURCES.find((s) => s.id === activeSource);

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {activeSource && (
              <button
                onClick={() => setActiveSource(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition text-gray-500"
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Import contacts
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {activeSourceDef
                  ? activeSourceDef.title
                  : "Select a source to import contacts from"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition text-gray-500"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Source picker */}
          {!activeSource && (
            <div className="grid grid-cols-2 gap-3">
              {SOURCES.map((source) => {
                const Icon = source.icon;
                return (
                  <button
                    key={source.id}
                    onClick={() => setActiveSource(source.id)}
                    className={`border border-gray-200 rounded-xl p-5 text-left transition-all flex items-start gap-4 group ${source.border}`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${source.bg}`}
                    >
                      <Icon size={18} className={source.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {source.title}
                        </h3>
                        <ChevronRight
                          size={14}
                          className="text-gray-400 group-hover:text-gray-600 transition"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {source.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* ── Add from my list ── */}
          {activeSource === "add_from_list" && (
            <AddFromListPanel
              campaignId={campaignId}
              onClose={onClose}
              onImported={onImported}
            />
          )}

          {/* ── LinkedIn Search ── */}
          {activeSource === "linkedin_search" && (
            <LinkedInUrlPanel
              campaignId={campaignId}
              importType="linkedin_search"
              label="LinkedIn Search URL"
              placeholder="https://www.linkedin.com/search/results/people/?keywords=..."
              hint="Go to LinkedIn → Search People, apply filters, paste the URL here."
              validate={(url) => url.includes("linkedin.com/search/results")}
              validationMsg="Must be a linkedin.com/search/results/people URL"
              onClose={onClose}
              onImported={onImported}
            />
          )}

          {/* ── Sales Navigator ── */}
          {activeSource === "sales_navigator" && (
            <LinkedInUrlPanel
              campaignId={campaignId}
              importType="sales_navigator"
              label="Sales Navigator URL"
              placeholder="https://www.linkedin.com/sales/search/people?..."
              hint="Go to Sales Navigator, run a search, paste the URL here."
              validate={(url) => url.includes("linkedin.com/sales/search")}
              validationMsg="Must be a linkedin.com/sales/search URL"
              onClose={onClose}
              onImported={onImported}
            />
          )}

          {/* ── LinkedIn Event ── */}
          {activeSource === "linkedin_event" && (
            <LinkedInUrlPanel
              campaignId={campaignId}
              importType="linkedin_event"
              label="LinkedIn Event URL"
              placeholder="https://www.linkedin.com/events/123456789/"
              hint="Open the LinkedIn event page and paste its URL here. We will import all attendees."
              validate={(url) => url.includes("linkedin.com/events")}
              validationMsg="Must be a linkedin.com/events URL"
              onClose={onClose}
              onImported={onImported}
            />
          )}

          {/* ── LinkedIn Post ── */}
          {activeSource === "linkedin_post" && (
            <LinkedInUrlPanel
              campaignId={campaignId}
              importType="linkedin_post"
              label="LinkedIn Post URL"
              placeholder="https://www.linkedin.com/posts/username_activity-..."
              hint="Open a LinkedIn post, click the 3-dot menu → Copy link, paste it here. We will import likers and commenters."
              validate={(url) =>
                url.includes("linkedin.com/posts") ||
                url.includes("linkedin.com/feed/update")
              }
              validationMsg="Must be a linkedin.com/posts or linkedin.com/feed/update URL"
              onClose={onClose}
              onImported={onImported}
            />
          )}

          {/* ── LinkedIn Group ── */}
          {activeSource === "linkedin_group" && (
            <LinkedInUrlPanel
              campaignId={campaignId}
              importType="linkedin_group"
              label="LinkedIn Group URL"
              placeholder="https://www.linkedin.com/groups/12345/"
              hint="Open the LinkedIn group page and paste its URL here. We will import members."
              validate={(url) => url.includes("linkedin.com/groups")}
              validationMsg="Must be a linkedin.com/groups URL"
              onClose={onClose}
              onImported={onImported}
            />
          )}

          {/* ── CSV ── */}
          {activeSource === "csv" && (
            <CSVPanel
              campaignId={campaignId}
              onClose={onClose}
              onImported={onImported}
            />
          )}

          {/* ── Lead Finder ── */}
          {activeSource === "lead_finder" && (
            <LeadFinderPanel
              campaignId={campaignId}
              onClose={onClose}
              onImported={onImported}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Shared status banner
───────────────────────────────────────── */
function StatusBanner({
  status,
  message,
}: {
  status: string;
  message: string;
}) {
  if (!message) return null;
  const styles: Record<string, string> = {
    error: "bg-red-50 text-red-600 border border-red-200",
    done: "bg-green-50 text-green-700 border border-green-200",
    loading: "bg-blue-50 text-blue-700 border border-blue-200",
  };
  const icons: Record<string, React.ReactNode> = {
    error: <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />,
    done: <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />,
    loading: (
      <Loader2 size={16} className="mt-0.5 flex-shrink-0 animate-spin" />
    ),
  };
  return (
    <div
      className={`text-sm px-4 py-3 rounded-xl flex items-start gap-2 ${styles[status] || styles.loading}`}
    >
      {icons[status]}
      <span>{message}</span>
    </div>
  );
}

/* ─────────────────────────────────────────
   Generic LinkedIn URL panel
   Used for: Search, Sales Nav, Event, Post, Group
───────────────────────────────────────── */
function LinkedInUrlPanel({
  campaignId,
  importType,
  label,
  placeholder,
  hint,
  validate,
  validationMsg,
  onClose,
  onImported,
}: {
  campaignId: string;
  importType: string;
  label: string;
  placeholder: string;
  hint: string;
  validate: (url: string) => boolean;
  validationMsg: string;
  onClose: () => void;
  onImported?: (count: number) => void;
}) {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  const handleImport = () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setStatus("error");
      setMessage("Please paste a URL.");
      return;
    }
    if (!validate(trimmed)) {
      setStatus("error");
      setMessage(validationMsg);
      return;
    }

    setStatus("loading");
    setMessage("Opening LinkedIn tab and scraping contacts…");

    // Fire extension pipeline
    window.postMessage(
      {
        type: "PROSP_START_IMPORT",
        payload: { url: trimmed, campaignId, importType },
      },
      "*",
    );

    // Poll for contacts
    let attempts = 0;
    let lastCount = 0;
    const poll = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`/api/campaigns/${campaignId}/contacts`);
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : (data?.contacts ?? []);
          const count = list.length;
          if (count > lastCount) {
            lastCount = count;
            setMessage(
              `Importing… ${count} contact${count !== 1 ? "s" : ""} found so far`,
            );
            onImported?.(count);
          }
        }
      } catch {
        /* ignore */
      }
      if (attempts >= 30) {
        clearInterval(poll);
        setStatus("done");
        setMessage(
          lastCount > 0
            ? `✅ ${lastCount} contacts imported! You can close this.`
            : "Import is running in the LinkedIn tab. Contacts will appear shortly.",
        );
      }
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <input
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setStatus("idle");
            setMessage("");
          }}
          placeholder={placeholder}
          disabled={status === "loading"}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-60"
        />
        <p className="text-xs text-gray-400">{hint}</p>
      </div>

      <StatusBanner status={status} message={message} />

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700">
        💡 Make sure the <strong>Prosp Chrome Extension</strong> is installed
        and active.
      </div>

      <div className="flex gap-3 pt-1">
        {status === "done" ? (
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 transition"
          >
            Close
          </button>
        ) : status === "loading" ? (
          <>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
            >
              Close (keep importing)
            </button>
            <div className="flex-1 py-2.5 bg-violet-400 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 cursor-not-allowed opacity-80">
              <Loader2 size={14} className="animate-spin" /> Importing…
            </div>
          </>
        ) : (
          <>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!url.trim()}
              className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              <Search size={14} /> Import Contacts
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Add from my list panel
───────────────────────────────────────── */
function AddFromListPanel({
  campaignId,
  onClose,
  onImported,
}: {
  campaignId: string;
  onClose: () => void;
  onImported?: (count: number) => void;
}) {
  const [contacts, setContacts] = useState<any[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/contacts")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setContacts(data);
      })
      .catch(() => setMessage("Failed to load contacts."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = contacts.filter((c) => {
    const q = search.toLowerCase();
    return `${c.firstName} ${c.lastName} ${c.company} ${c.position}`
      .toLowerCase()
      .includes(q);
  });

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((c) => c.id)));
  };

  const handleAdd = async () => {
    if (selected.size === 0) {
      setStatus("error");
      setMessage("Select at least one contact.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactIds: [...selected] }),
      });
      const data = await res.json();
      const count = data.count ?? selected.size;
      setStatus("done");
      setMessage(
        `✅ ${count} contact${count !== 1 ? "s" : ""} added to campaign!`,
      );
      onImported?.(count);
    } catch {
      setStatus("error");
      setMessage("Failed to add contacts. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search contacts…"
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
      />

      <div className="border border-gray-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-10 text-gray-400">
            <Loader2 size={18} className="animate-spin mr-2" /> Loading
            contacts…
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-400">
            No contacts found
          </div>
        ) : (
          <>
            {/* Select all row */}
            <div
              className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 border-b border-gray-200 cursor-pointer"
              onClick={toggleAll}
            >
              <input
                type="checkbox"
                readOnly
                checked={
                  selected.size === filtered.length && filtered.length > 0
                }
                className="w-4 h-4 accent-violet-600"
              />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Select all ({filtered.length})
              </span>
            </div>
            {filtered.map((c) => (
              <div
                key={c.id}
                onClick={() => toggle(c.id)}
                className={`flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 transition ${selected.has(c.id) ? "bg-violet-50" : ""}`}
              >
                <input
                  type="checkbox"
                  readOnly
                  checked={selected.has(c.id)}
                  className="w-4 h-4 accent-violet-600"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 truncate">
                    {c.firstName} {c.lastName}
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    {[c.position, c.company].filter(Boolean).join(" at ") ||
                      c.email ||
                      "—"}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {selected.size > 0 && (
        <p className="text-xs text-violet-600 font-medium">
          {selected.size} contact{selected.size !== 1 ? "s" : ""} selected
        </p>
      )}

      <StatusBanner status={status} message={message} />

      <div className="flex gap-3">
        {status === "done" ? (
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 transition"
          >
            Close
          </button>
        ) : (
          <>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={saving || selected.size === 0}
              className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Adding…
                </>
              ) : (
                <>
                  <Users size={14} /> Add{" "}
                  {selected.size > 0 ? selected.size : ""} Contacts
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   CSV Panel
───────────────────────────────────────── */
function CSVPanel({
  campaignId,
  onClose,
  onImported,
}: {
  campaignId: string;
  onClose: () => void;
  onImported?: (count: number) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [parsed, setParsed] = useState<ParsedContact[]>([]);
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      setError("Please upload a .csv file");
      return;
    }
    setFileName(file.name);
    setError("");
    const reader = new FileReader();
    reader.onload = (e) => {
      const contacts = parseCSV(e.target?.result as string);
      if (contacts.length === 0) {
        setError("No valid contacts found. Check your CSV format.");
        return;
      }
      setParsed(contacts);
    };
    reader.readAsText(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const importAll = async () => {
    setUploading(true);
    try {
      const results = await Promise.allSettled(
        parsed.map((c) =>
          fetch("/api/contacts/save", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": "prosp-extension-secret-123",
            },
            body: JSON.stringify({
              firstName: c.firstName,
              lastName: c.lastName,
              email: c.email,
              company: c.company,
              position: c.position,
              linkedinUrl: c.linkedInUrl,
              campaignId,
            }),
          }),
        ),
      );
      const saved = results.filter((r) => r.status === "fulfilled").length;
      setDone(true);
      onImported?.(saved);
    } catch {
      setError("Import failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (done)
    return (
      <div className="flex flex-col gap-4 items-center py-6">
        <CheckCircle2 size={40} className="text-green-500" />
        <p className="font-semibold text-gray-900">
          {parsed.length} contacts imported!
        </p>
        <button
          onClick={onClose}
          className="px-6 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 transition"
        >
          Close
        </button>
      </div>
    );

  if (parsed.length === 0)
    return (
      <div className="flex flex-col gap-4">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${dragging ? "border-violet-500 bg-violet-50" : "border-gray-200 hover:border-violet-400 hover:bg-gray-50"}`}
        >
          <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Upload size={22} className="text-violet-500" />
          </div>
          <p className="font-semibold text-gray-900 mb-1">
            {dragging ? "Drop it!" : "Drop your CSV here"}
          </p>
          <p className="text-sm text-gray-500 mb-3">or click to browse</p>
          <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
            .csv files only
          </span>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) =>
              e.target.files?.[0] && handleFile(e.target.files[0])
            }
          />
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-500 mb-1">
            Expected columns:
          </p>
          <p className="text-xs text-gray-400 font-mono">
            first_name, last_name, email, phone, company, position, linkedin_url
          </p>
        </div>
        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 text-sm">
            <AlertCircle size={14} />
            {error}
          </div>
        )}
      </div>
    );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-xl p-3 text-sm">
        <CheckCircle2 size={15} />
        <span className="font-semibold">
          {parsed.length} contacts ready · {fileName}
        </span>
      </div>
      <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200 max-h-52 overflow-y-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              {["Name", "Email", "Company"].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-2.5 text-xs font-bold text-gray-400 uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {parsed.slice(0, 10).map((c, i) => (
              <tr key={i} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-2.5 font-medium text-gray-900">
                  {c.firstName} {c.lastName}
                </td>
                <td className="px-4 py-2.5 text-gray-500">{c.email || "—"}</td>
                <td className="px-4 py-2.5 text-gray-500">
                  {c.company || "—"}
                </td>
              </tr>
            ))}
            {parsed.length > 10 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-2.5 text-xs text-gray-400 text-center"
                >
                  + {parsed.length - 10} more
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => {
            setParsed([]);
            setFileName("");
          }}
          className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
        >
          Change File
        </button>
        <button
          onClick={importAll}
          disabled={uploading}
          className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Importing…
            </>
          ) : (
            <>
              <Upload size={14} /> Import {parsed.length} Contacts
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Lead Finder Panel
───────────────────────────────────────── */
function LeadFinderPanel({
  campaignId,
  onClose,
  onImported,
}: {
  campaignId: string;
  onClose: () => void;
  onImported?: (count: number) => void;
}) {
  const [filters, setFilters] = useState({
    title: "",
    company: "",
    location: "",
    industry: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  const set =
    (k: keyof typeof filters) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setFilters((prev) => ({ ...prev, [k]: e.target.value }));

  const handleSearch = () => {
    if (
      !filters.title &&
      !filters.company &&
      !filters.location &&
      !filters.industry
    ) {
      setStatus("error");
      setMessage("Enter at least one filter.");
      return;
    }
    // Build LinkedIn search URL and fire the extension
    const keywords = [
      filters.title,
      filters.company,
      filters.location,
      filters.industry,
    ]
      .filter(Boolean)
      .join(" ");
    const searchUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(keywords)}`;

    setStatus("loading");
    setMessage("Opening LinkedIn tab and searching for leads…");

    window.postMessage(
      {
        type: "PROSP_START_IMPORT",
        payload: { url: searchUrl, campaignId, importType: "lead_finder" },
      },
      "*",
    );

    let attempts = 0,
      lastCount = 0;
    const poll = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`/api/campaigns/${campaignId}/contacts`);
        if (res.ok) {
          const data = await res.json();
          const count = (Array.isArray(data) ? data : (data?.contacts ?? []))
            .length;
          if (count > lastCount) {
            lastCount = count;
            setMessage(`Importing… ${count} leads found so far`);
            onImported?.(count);
          }
        }
      } catch {
        /* ignore */
      }
      if (attempts >= 30) {
        clearInterval(poll);
        setStatus("done");
        setMessage(
          lastCount > 0
            ? `✅ ${lastCount} leads imported!`
            : "Import running in LinkedIn tab. Contacts will appear shortly.",
        );
      }
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        {(
          [
            {
              key: "title",
              label: "Job Title",
              placeholder: "e.g. CTO, VP Sales",
            },
            {
              key: "company",
              label: "Company",
              placeholder: "e.g. Stripe, Airbnb",
            },
            {
              key: "location",
              label: "Location",
              placeholder: "e.g. Bangalore, India",
            },
            {
              key: "industry",
              label: "Industry",
              placeholder: "e.g. SaaS, Fintech",
            },
          ] as const
        ).map((f) => (
          <div key={f.key} className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600">
              {f.label}
            </label>
            <input
              type="text"
              value={filters[f.key]}
              onChange={set(f.key)}
              placeholder={f.placeholder}
              disabled={status === "loading"}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-60"
            />
          </div>
        ))}
      </div>

      <StatusBanner status={status} message={message} />

      <div className="flex gap-3 pt-1">
        {status === "done" ? (
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 transition"
          >
            Close
          </button>
        ) : status === "loading" ? (
          <>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
            >
              Close (keep importing)
            </button>
            <div className="flex-1 py-2.5 bg-violet-400 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 cursor-not-allowed opacity-80">
              <Loader2 size={14} className="animate-spin" /> Searching…
            </div>
          </>
        ) : (
          <>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSearch}
              className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 transition flex items-center justify-center gap-2"
            >
              <Search size={14} /> Find Leads
            </button>
          </>
        )}
      </div>
    </div>
  );
}
