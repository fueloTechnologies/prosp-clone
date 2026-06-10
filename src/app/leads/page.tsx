"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import ContactsTable from "@/components/leads/ContactsTable";
import AddContactModal from "@/components/leads/AddContactModal";
import EnrichmentPanel from "@/components/leads/EnrichmentPanel";
import {
  Plus,
  Upload,
  Search,
  SlidersHorizontal,
  Download,
} from "lucide-react";

export default function LeadsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEnrichPanel, setShowEnrichPanel] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const STATUS_OPTIONS = [
    "ALL",
    "NEW",
    "CONTACTED",
    "REPLIED",
    "INTERESTED",
    "NOT_INTERESTED",
    "CONVERTED",
  ];

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/contacts");
      const data = await res.json();
      setContacts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = contacts.filter((c) => {
    const text =
      `${c.firstName || ""} ${c.lastName || ""} ${c.company || ""} ${c.position || ""} ${c.location || ""}`.toLowerCase();
    const matchSearch = text.includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleUpdated = (updated: any) => {
    if (updated._deleted) {
      setContacts((prev) => prev.filter((c) => c.id !== updated.id));
      if (selected?.id === updated.id) setSelected(null);
    } else {
      setContacts((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c)),
      );
      if (selected?.id === updated.id) setSelected(updated);
    }
  };

  const exportCSV = () => {
    const headers = [
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Company",
      "Position",
      "Location",
      "LinkedIn",
      "Status",
    ];
    const rows = filtered.map((c) => [
      c.firstName,
      c.lastName,
      c.email || "",
      c.phone || "",
      c.company || "",
      c.position || "",
      c.location || "",
      c.linkedInUrl || "",
      c.status || "NEW",
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${v}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads.csv";
    a.click();
  };

  return (
    <AppShell activeTab="leads">
      <div className="flex flex-col h-full overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ececf4] bg-white flex-shrink-0">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Leads</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {contacts.length} total contacts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="h-9 px-4 rounded-xl border border-[#ececf4] bg-white hover:bg-gray-50 text-sm font-medium flex items-center gap-2 text-gray-600 transition"
            >
              <Download size={14} />
              Export
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="h-9 px-4 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-sm font-semibold flex items-center gap-2 shadow-md hover:scale-[1.02] transition"
            >
              <Plus size={14} />
              Add Contact
            </button>
          </div>
        </div>

        {/* FILTERS */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-[#ececf4] bg-white flex-shrink-0">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 h-9 border border-[#ececf4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal size={13} className="text-gray-400" />
            <div className="flex gap-1">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`h-7 px-3 rounded-lg text-xs font-medium transition ${
                    statusFilter === s
                      ? "bg-violet-100 text-violet-700 border border-violet-200"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {s === "ALL"
                    ? "All"
                    : s.charAt(0) + s.slice(1).toLowerCase().replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          <span className="text-xs text-gray-400 ml-auto">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* TABLE */}
        <div className="flex-1 overflow-y-auto p-6">
          <ContactsTable
            contacts={filtered}
            selected={selected}
            onSelect={(c) => {
              setSelected(c);
              setShowEnrichPanel(true);
            }}
            loading={loading}
            onUpdated={handleUpdated}
          />
        </div>
      </div>

      {/* ADD CONTACT MODAL */}
      {showAddModal && (
        <AddContactModal
          onClose={() => setShowAddModal(false)}
          onAdded={(newContact) => {
            setContacts((prev) => [newContact, ...prev]);
            setShowAddModal(false);
          }}
        />
      )}

      {/* ENRICH PANEL */}
      {showEnrichPanel && selected && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div
            className="flex-1 bg-black/20"
            onClick={() => {
              setShowEnrichPanel(false);
              setSelected(null);
            }}
          />
          <div className="w-[380px] bg-white border-l border-[#ececf4] shadow-2xl overflow-y-auto">
            <EnrichmentPanel
              contact={selected}
              onClose={() => {
                setShowEnrichPanel(false);
                setSelected(null);
              }}
              onEnriched={(updated) => {
                handleUpdated(updated);
              }}
            />
          </div>
        </div>
      )}
    </AppShell>
  );
}
