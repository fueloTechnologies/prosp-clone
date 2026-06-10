"use client";
import {
  Mail,
  Phone,
  Linkedin,
  Trash2,
  Building2,
  Sparkles,
  UserPlus,
  CheckCircle2,
} from "lucide-react";
import { getInitials } from "@/lib/utils";
import { useState } from "react";

const STATUS_BADGE: Record<string, { label: string; class: string }> = {
  NEW: { label: "New", class: "bg-gray-100 text-gray-600" },
  CONTACTED: { label: "Contacted", class: "bg-blue-100 text-blue-700" },
  REPLIED: { label: "Replied", class: "bg-green-100 text-green-700" },
  INTERESTED: { label: "Interested", class: "bg-purple-100 text-purple-700" },
  NOT_INTERESTED: { label: "Not interested", class: "bg-red-100 text-red-600" },
  CONVERTED: { label: "Converted", class: "bg-amber-100 text-amber-700" },
};

const AVATAR_COLORS = [
  { bg: "#ede9fe", text: "#6B5CE7" },
  { bg: "#dcfce7", text: "#16a34a" },
  { bg: "#fef3c7", text: "#d97706" },
  { bg: "#ffe4e6", text: "#e11d48" },
  { bg: "#e0f2fe", text: "#0284c7" },
  { bg: "#f3e8ff", text: "#9333ea" },
];

interface Props {
  contacts: any[];
  selected: any | null;
  onSelect: (c: any) => void;
  loading: boolean;
  onUpdated: (c: any) => void;
}

export default function ContactsTable({
  contacts,
  selected,
  onSelect,
  loading,
  onUpdated,
}: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [enrichingId, setEnrichingId] = useState<string | null>(null);

  const getAvatarColor = (name: string) =>
    AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

  const deleteContact = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this contact?")) return;
    setDeletingId(id);
    await fetch(`/api/contacts/${id}`, { method: "DELETE" });
    onUpdated({ id, _deleted: true });
    setDeletingId(null);
  };

  const enrichContact = async (c: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEnrichingId(c.id);
    try {
      const res = await fetch(`/api/contacts/${c.id}/enrich`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.contact) onUpdated(data.contact);
    } catch (err) {
      console.error("Enrich failed:", err);
    } finally {
      setEnrichingId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#ececf4] overflow-hidden p-4 space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#ececf4] overflow-hidden">
      {contacts.length > 0 && (
        <div className="flex items-center gap-2 px-5 py-3 border-b border-[#ececf4] bg-gray-50/60">
          <CheckCircle2 size={14} className="text-violet-500" />
          <span className="text-sm font-semibold text-gray-700">
            {contacts.length} contacts
          </span>
        </div>
      )}

      {contacts.length === 0 ? (
        <div className="py-20 text-center text-gray-400">
          <div className="text-5xl mb-4">👥</div>
          <p className="font-semibold text-gray-600 mb-1">No contacts yet</p>
          <p className="text-sm">Import a CSV or add contacts manually</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#ececf4]">
                {[
                  "Name",
                  "Contact",
                  "Position & Company",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left text-xs font-bold text-gray-400 py-3 px-5 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => {
                const color = getAvatarColor(c.firstName || "A");
                const badge = STATUS_BADGE[c.status] || STATUS_BADGE.NEW;
                const isSelected = selected?.id === c.id;

                return (
                  <tr
                    key={c.id}
                    onClick={() => onSelect(c)}
                    className={`border-b border-[#ececf4] last:border-0 cursor-pointer transition-colors group ${
                      isSelected ? "bg-violet-50" : "hover:bg-gray-50/60"
                    }`}
                  >
                    {/* Name + Avatar */}
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        {c.avatar ? (
                          <img
                            src={c.avatar}
                            alt={c.firstName}
                            className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                            onError={(e) =>
                              (e.currentTarget.style.display = "none")
                            }
                          />
                        ) : (
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ background: color.bg, color: color.text }}
                          >
                            {getInitials(`${c.firstName} ${c.lastName}`)}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                            {c.firstName} {c.lastName}
                          </p>
                          {c.location && (
                            <p className="text-xs text-gray-400">
                              {c.location}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email + Phone */}
                    <td className="py-3 px-5">
                      <div className="space-y-1">
                        {c.email ? (
                          <div className="flex items-center gap-1.5">
                            <Mail
                              size={12}
                              className="text-gray-400 flex-shrink-0"
                            />
                            <span className="text-xs text-gray-600">
                              {c.email}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-300">
                            No email
                          </span>
                        )}
                        {c.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone
                              size={12}
                              className="text-gray-400 flex-shrink-0"
                            />
                            <span className="text-xs text-gray-600">
                              {c.phone}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Position + Company */}
                    <td className="py-3 px-5">
                      <div className="space-y-0.5">
                        {c.position ? (
                          <p className="text-sm text-gray-700 max-w-[200px] truncate">
                            {c.position}
                          </p>
                        ) : (
                          <span className="text-sm text-gray-300">—</span>
                        )}
                        {c.company && (
                          <div className="flex items-center gap-1">
                            <Building2
                              size={11}
                              className="text-gray-400 flex-shrink-0"
                            />
                            <span className="text-xs text-gray-400 max-w-[180px] truncate">
                              {c.company}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-5">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold whitespace-nowrap ${badge.class}`}
                      >
                        {badge.label}
                      </span>
                    </td>

                    {/* ✅ VISIBLE ACTION BUTTONS */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* LinkedIn */}
                        {c.linkedInUrl && (
                          <a
                            href={c.linkedInUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            title="View LinkedIn profile"
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-blue-500 hover:bg-blue-50 transition-colors"
                          >
                            <Linkedin size={14} />
                          </a>
                        )}

                        {/* Enrich */}
                        <button
                          onClick={(e) => enrichContact(c, e)}
                          disabled={enrichingId === c.id}
                          title="Enrich contact data"
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-violet-500 hover:bg-violet-50 transition-colors disabled:opacity-50"
                        >
                          {enrichingId === c.id ? (
                            <span className="w-3.5 h-3.5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Sparkles size={14} />
                          )}
                        </button>

                        {/* Add to campaign */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect(c);
                          }}
                          title="Add to campaign"
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-green-500 hover:bg-green-50 transition-colors"
                        >
                          <UserPlus size={14} />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={(e) => deleteContact(c.id, e)}
                          disabled={deletingId === c.id}
                          title="Delete contact"
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          {deletingId === c.id ? (
                            <span className="w-3.5 h-3.5 border-2 border-red-300 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
