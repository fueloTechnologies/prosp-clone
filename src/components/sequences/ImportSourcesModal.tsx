"use client";

import { X, ChevronRight } from "lucide-react";

interface Props {
  onClose: () => void;
  onSelect: (type: string) => void;
}

const options = [
  {
    key: "LIST",
    title: "Add from my list",
    desc: "Import contacts from your existing lists.",
  },
  {
    key: "LINKEDIN_SEARCH",
    title: "LinkedIn Search",
    desc: "Import leads from any LinkedIn search URL",
  },
  {
    key: "SALES_NAV",
    title: "Sales Navigator",
    desc: "Paste your sales navigator search URL",
  },
  {
    key: "LEAD_FINDER",
    title: "Lead finder",
    desc: "Search with filters and keywords",
  },
  {
    key: "CSV",
    title: "Import from CSV",
    desc: "Import your CSV file of LinkedIn profiles",
  },
  {
    key: "LINKEDIN_EVENT",
    title: "LinkedIn Event",
    desc: "Import leads attending an event",
  },
  {
    key: "LINKEDIN_POST",
    title: "LinkedIn Post",
    desc: "Import comments or likes of a post",
  },
  {
    key: "LINKEDIN_GROUP",
    title: "LinkedIn Group",
    desc: "Import leads from LinkedIn groups",
  },
];

export default function ImportSourcesModal({ onClose, onSelect }: Props) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl">
        {/* HEADER */}

        <div className="flex items-center justify-between px-8 py-6 border-b border-[#ececf4]">
          <div>
            <h2 className="text-3xl font-bold text-[#111827]">
              Import contacts
            </h2>

            <p className="text-gray-500 mt-2">
              Select a source to import contacts from
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
          >
            <X size={22} />
          </button>
        </div>

        {/* GRID */}

        <div className="grid grid-cols-2 gap-4 p-8 bg-[#fafafa]">
          {options.map((item) => (
            <button
              key={item.key}
              onClick={() => onSelect(item.key)}
              className="
                group
                bg-white
                hover:bg-[#f8f7ff]
                border
                border-[#ececf4]
                rounded-2xl
                p-6
                text-left
                transition-all
                hover:border-violet-200
                hover:shadow-lg
              "
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-[#111827] text-xl mb-2">
                    {item.title}
                  </h3>

                  <p className="text-gray-500 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <ChevronRight
                  size={18}
                  className="
                    text-gray-400
                    group-hover:text-violet-500
                    transition-all
                    group-hover:translate-x-1
                  "
                />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
