"use client";

import { Loader2 } from "lucide-react";

interface Props {
  campaigns: any;
  selected: any;
  onSelect: (c: any) => void;
  loading?: boolean;
}

export default function CampaignList({
  campaigns,
  selected,
  onSelect,
  loading,
}: Props) {
  // Always ensure campaigns is an array

  const safeCampaigns = Array.isArray(campaigns) ? campaigns : [];

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {/* Loading */}

      {loading && (
        <div className="flex items-center justify-center py-6">
          <Loader2 size={16} className="animate-spin" />
        </div>
      )}

      {/* Empty State */}

      {!loading && safeCampaigns.length === 0 && (
        <div className="text-center text-sm text-gray-500 py-6">
          No campaigns yet
        </div>
      )}

      {/* Campaign List */}

      {safeCampaigns.map((c: any, index: number) => (
        <div
          key={c?.id ?? `campaign-${index}`}
          onClick={() => onSelect(c)}
          className={`
  relative
  rounded-2xl
  p-4
  cursor-pointer
  transition-all
  duration-300
  border
  ${
    selected?.id === c?.id
      ? `
        bg-gradient-to-r
        from-violet-50
        to-fuchsia-50
        border-violet-200
        shadow-sm
      `
      : `
        border-transparent
        hover:bg-[#fafafe]
        hover:border-[#ececf4]
      `
  }
`}
        >
          {selected?.id === c?.id && (
            <div
              className="
      absolute
      left-0
      top-3
      bottom-3
      w-1
      rounded-r-full
      bg-gradient-to-b
      from-violet-500
      to-fuchsia-500
    "
            />
          )}
          {/* Campaign Name */}
          <div className="font-semibold text-[15px] text-gray-900">
            {c?.name || "Untitled Campaign"}
          </div>

          {/* Campaign Info */}

          <div className="text-sm text-gray-500 mt-1">
            {c?.status || "Draft"}
            {" • "}
            {c?.totalContacts ?? c?._count?.contacts ?? 0} contacts
          </div>
        </div>
      ))}
    </div>
  );
}
