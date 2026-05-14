"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";

function Avatar({
  firstName,
  lastName,
  avatar,
}: {
  firstName: string;
  lastName: string;
  avatar?: string;
}) {
  const [imgFailed, setImgFailed] = useState(false);

  if (avatar && !imgFailed) {
    return (
      <img
        src={avatar}
        alt={firstName}
        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        onError={() => setImgFailed(true)}
      />
    );
  }

  return (
    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold text-sm flex-shrink-0">
      {firstName?.[0]}
      {lastName?.[0]}
    </div>
  );
}

export default function LeadsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContacts = async () => {
      try {
        const res = await fetch("/api/contacts");
        const data = await res.json();
        if (Array.isArray(data)) {
          setContacts(data);
        } else {
          setContacts([]);
        }
      } catch (err) {
        console.error(err);
        setContacts([]);
      } finally {
        setLoading(false);
      }
    };
    loadContacts();
  }, []);

  const filtered = Array.isArray(contacts)
    ? contacts.filter((c) => {
        const text =
          `${c.firstName || ""} ${c.lastName || ""} ${c.company || ""} ${c.position || ""} ${c.location || ""}`.toLowerCase();
        return text.includes(search.toLowerCase());
      })
    : [];

  return (
    <AppShell activeTab="leads">
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-4">Leads</h1>
        <input
          type="text"
          placeholder="Search leads..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-3 py-2 border rounded-lg mb-4"
        />
        {loading && <p className="text-gray-500">Loading contacts...</p>}
        {!loading && filtered.length === 0 && (
          <p className="text-gray-500">No contacts found</p>
        )}
        <div className="space-y-2">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="p-3 border rounded-lg flex justify-between items-start"
            >
              <div className="flex gap-3 items-start">
                <Avatar
                  firstName={c.firstName}
                  lastName={c.lastName}
                  avatar={c.avatar}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      {c.firstName} {c.lastName}
                    </p>
                    {c.linkedInUrl && (
                      <a
                        href={c.linkedInUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-xs"
                      >
                        LinkedIn ↗
                      </a>
                    )}
                  </div>
                  {c.position && (
                    <p className="text-sm text-gray-600">{c.position}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    {c.company || "No company"}
                  </p>
                  {c.location && (
                    <p className="text-xs text-gray-400">{c.location}</p>
                  )}
                </div>
              </div>
              <div className="text-sm text-gray-400 text-right">
                <p>{c.email || "No email"}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
