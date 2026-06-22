"use client";
// src/components/inbox/ContactPanel.tsx

import {
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Building2,
  Briefcase,
  ExternalLink,
} from "lucide-react";

const AVATAR_COLORS = [
  { bg: "#ede9fe", text: "#6d28d9" },
  { bg: "#dcfce7", text: "#15803d" },
  { bg: "#fef3c7", text: "#b45309" },
  { bg: "#ffe4e6", text: "#be123c" },
  { bg: "#e0f2fe", text: "#0369a1" },
];

function getColor(name: string) {
  return AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
}

function getInitials(first = "", last = "") {
  return `${first[0] || ""}${last[0] || ""}`.toUpperCase();
}

export default function ContactPanel({ contact }: { contact: any }) {
  if (!contact) return null;

  const color = getColor(contact.firstName || "A");

  const fields = [
    { icon: Building2, label: "Company", value: contact.company },
    { icon: Briefcase, label: "Position", value: contact.position },
    {
      icon: Mail,
      label: "Email",
      value: contact.email,
      href: `mailto:${contact.email}`,
    },
    {
      icon: Phone,
      label: "Phone",
      value: contact.phone,
      href: `tel:${contact.phone}`,
    },
    { icon: MapPin, label: "Location", value: contact.location },
  ].filter((f) => f.value);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#ececf4]">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
          Contact Info
        </p>

        {/* Avatar + name */}
        <div className="flex flex-col items-center text-center">
          {contact.avatar ? (
            <img
              src={contact.avatar}
              className="w-16 h-16 rounded-full object-cover mb-3"
              alt=""
            />
          ) : (
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mb-3"
              style={{ background: color.bg, color: color.text }}
            >
              {getInitials(contact.firstName, contact.lastName)}
            </div>
          )}
          <h3 className="font-semibold text-gray-900 text-sm">
            {contact.firstName} {contact.lastName}
          </h3>
          {contact.position && (
            <p className="text-xs text-gray-500 mt-0.5">{contact.position}</p>
          )}
          {contact.company && (
            <p className="text-xs text-gray-400">{contact.company}</p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          {contact.linkedInUrl && (
            <a
              href={contact.linkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 h-8 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-blue-100 transition-colors"
            >
              <Linkedin size={12} />
              LinkedIn
            </a>
          )}
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="flex-1 h-8 rounded-xl bg-violet-50 border border-violet-100 text-violet-600 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-violet-100 transition-colors"
            >
              <Mail size={12} />
              Email
            </a>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="px-5 py-4 space-y-3 flex-1 overflow-y-auto">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Details
        </p>

        {fields.map(({ icon: Icon, label, value, href }: any) => (
          <div key={label} className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon size={13} className="text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">
                {label}
              </p>
              {href ? (
                <a
                  href={href}
                  className="text-xs text-violet-600 hover:underline truncate block"
                >
                  {value}
                </a>
              ) : (
                <p className="text-xs text-gray-700 truncate">{value}</p>
              )}
            </div>
          </div>
        ))}

        {fields.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">
            No additional details
          </p>
        )}

        {/* Tags */}
        {contact.tags && contact.tags.length > 0 && (
          <div className="pt-3 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-2">
              Tags
            </p>
            <div className="flex flex-wrap gap-1.5">
              {contact.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* View full profile */}
        <div className="pt-3 border-t border-gray-100">
          <a
            href={`/leads?contact=${contact.id}`}
            className="flex items-center justify-center gap-1.5 w-full h-8 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <ExternalLink size={12} />
            View full profile
          </a>
        </div>
      </div>
    </div>
  );
}
