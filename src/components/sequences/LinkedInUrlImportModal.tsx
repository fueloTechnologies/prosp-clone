"use client";

import { useState } from "react";
import { X, Linkedin, Loader2 } from "lucide-react";

interface Props {
  campaignId: string;
  type: string;
  onClose: () => void;
  onImported: () => void;
}

export default function LinkedInUrlImportModal({
  campaignId,
  type,
  onClose,
  onImported,
}: Props) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const startImport = async () => {
    if (!url.trim()) {
      alert("Paste a LinkedIn URL");
      return;
    }

    try {
      setLoading(true);

      /*
      SEND TO CHROME EXTENSION
    */

      window.postMessage(
        {
          type: "PROSP_START_IMPORT",

          payload: {
            url,
            campaignId,
            importType: type,
          },
        },
        "*",
      );
      window.postMessage(
        {
          type: "PROSP_START_IMPORT",

          payload: {
            url,
            campaignId,
            importType: type,
          },
        },
        "*",
      );

      console.log("🔥 POST MESSAGE SENT");

      alert("Import started 🚀");

      /*
      OPTIONAL BACKEND LOG
    */

      await fetch("/api/import/linkedin", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          url,
          type,
          campaignId,
        }),
      });

      setTimeout(() => {
        onImported();
      }, 1000);
    } catch (err) {
      console.error(err);

      alert("Import failed");
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (type) {
      case "LINKEDIN_SEARCH":
        return "LinkedIn Search";

      case "SALES_NAV":
        return "Sales Navigator";

      case "LINKEDIN_EVENT":
        return "LinkedIn Event";

      case "LINKEDIN_POST":
        return "LinkedIn Post";

      case "LINKEDIN_GROUP":
        return "LinkedIn Group";

      default:
        return "LinkedIn Import";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden">
        {/* HEADER */}

        <div className="flex items-center justify-between px-8 py-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0A66C2]/10 flex items-center justify-center">
              <Linkedin className="text-[#0A66C2]" />
            </div>

            <div>
              <h2 className="text-2xl font-bold">{getTitle()}</h2>

              <p className="text-sm text-gray-500 mt-1">
                Paste your LinkedIn URL
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENT */}

        <div className="p-8">
          <label className="text-sm font-medium text-gray-700">
            LinkedIn URL
          </label>

          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.linkedin.com/search/results/people/..."
            className="
              w-full
              mt-2
              border
              border-gray-200
              rounded-2xl
              px-4
              py-4
              outline-none
              focus:border-violet-500
            "
          />

          <div className="mt-4 bg-violet-50 border border-violet-100 rounded-2xl p-4">
            <div className="text-sm text-violet-700 font-medium">
              Chrome Extension Required
            </div>

            <p className="text-xs text-violet-600 mt-1 leading-relaxed">
              The extension will securely scrape LinkedIn results directly from
              your browser session.
            </p>
          </div>

          <button
            onClick={startImport}
            disabled={loading}
            className="
              mt-6
              w-full
              h-12
              rounded-2xl
              bg-gradient-to-r
              from-violet-500
              to-fuchsia-500
              text-white
              font-semibold
              flex
              items-center
              justify-center
              gap-2
            "
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Starting Import...
              </>
            ) : (
              <>
                <Linkedin size={16} />
                Start Import
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
