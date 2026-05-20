"use client";

// src/components/inbox/AccountSidebar.tsx

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  activeIndex: number;
  onSelect: (idx: number) => void;
}

interface Account {
  initials: string;
  color: string;
  name: string;
  unread: number;
}

export default function AccountSidebar({ activeIndex, onSelect }: Props) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const accounts: Account[] = user
    ? [
        {
          initials: user.name
            ?.split(" ")
            .map((n: string) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase(),

          color: "#6B5CE7",

          name: user.name,

          unread: 0,
        },
      ]
    : [];

  return (
    <div className="w-16 border-r border-border flex flex-col items-center py-4 gap-2 flex-shrink-0">
      {accounts.map((acc, idx) => (
        <div
          key={idx}
          onClick={() => onSelect(idx)}
          title={acc.name}
          className={`relative w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer transition-all ${
            idx === activeIndex
              ? "ring-2 ring-offset-2 scale-105"
              : "opacity-60 hover:opacity-100 hover:scale-105"
          }`}
          style={{
            background: acc.color,
            color: "white",
          }}
        >
          {acc.initials}

          {acc.unread > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
              {acc.unread > 9 ? "9+" : acc.unread}
            </span>
          )}
        </div>
      ))}

      {/* Add account button */}
      <div className="mt-2 w-9 h-9 rounded-full border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-all text-ink-tertiary hover:text-brand-500">
        <Plus size={16} />
      </div>
    </div>
  );
}
