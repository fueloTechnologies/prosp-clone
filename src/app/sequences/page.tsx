"use client";

// src/app/sequences/page.tsx

import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import SequenceBuilder from "@/components/sequences/SequenceBuilder";
import CampaignList from "@/components/sequences/CampaignList";
import { Plus } from "lucide-react";

export default function SequencesPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);

  const [selected, setSelected] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  /* =========================
     LOAD CAMPAIGNS
  ========================= */

  useEffect(() => {
    fetch("/api/campaigns")
      .then((r) => r.json())

      .then((data) => {
        console.log("Loaded campaigns:", data);

        // Normalize campaigns safely

        const normalized = Array.isArray(data)
          ? data.map((c: any) => ({
              ...c,

              totalContacts: c.totalContacts ?? c._count?.contacts ?? 0,
            }))
          : [];

        setCampaigns(normalized);

        if (normalized.length > 0) {
          console.log("Auto selecting:", normalized[0]);

          setSelected(normalized[0]);
        }

        setLoading(false);
      })

      .catch((err) => {
        console.error("Campaign load error:", err);

        setLoading(false);
      });
  }, []);

  /* =========================
     CREATE CAMPAIGN
  ========================= */

  const createCampaign = async () => {
    const name = prompt("Enter Campaign Name");

    if (!name) return;

    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,

        dailyLimit: 25,
      }),
    });

    const campaign = await res.json();

    const normalized = {
      ...campaign,

      totalContacts: 0,
    };

    setCampaigns((prev) => [normalized, ...prev]);

    setSelected(normalized);
  };

  /* =========================
     HANDLE SELECT
  ========================= */

  const handleSelect = (campaign: any) => {
    console.log("Selected campaign:", campaign);

    setSelected(campaign);
  };

  return (
    <AppShell activeTab="campaigns">
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL */}

        <div
          className="
    w-[300px]
    border-r
    border-[#ececf4]
    bg-[#fcfcff]
    flex
    flex-col
    flex-shrink-0
    overflow-y-auto
  "
        >
          <div
            className="
    p-5
    border-b
    border-[#ececf4]
    flex
    items-center
    justify-between
  "
          >
            <h2 className="text-lg font-bold text-gray-900">Campaigns</h2>

            <button
              onClick={createCampaign}
              className="
w-10
h-10
rounded-2xl
bg-gradient-to-r
from-violet-500
to-fuchsia-500
flex
items-center
justify-center
text-white
shadow-md
hover:scale-105
transition-all
duration-200
"
            >
              <Plus size={14} />
            </button>
          </div>

          <CampaignList
            campaigns={campaigns}
            selected={selected}
            onSelect={handleSelect}
            loading={loading}
          />
        </div>

        {/* RIGHT PANEL */}

        <div className="flex-1 overflow-hidden flex flex-col">
          {selected ? (
            <SequenceBuilder
              campaign={selected}
              onUpdate={(updated: any) => {
                setCampaigns((prev) =>
                  prev.map((c) => (c.id === updated.id ? updated : c)),
                );

                setSelected(updated);
              }}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-ink-tertiary">
              <div className="text-center">
                <div className="text-5xl mb-4">🎯</div>

                <p className="font-semibold text-ink mb-1">No campaigns yet</p>

                <p className="text-sm text-ink-secondary mb-4">
                  Create your first outreach campaign
                </p>

                <button
                  onClick={createCampaign}
                  className="btn-primary mx-auto"
                >
                  <Plus size={14} /> New Campaign
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
