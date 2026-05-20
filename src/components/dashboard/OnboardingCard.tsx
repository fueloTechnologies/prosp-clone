"use client";

import { useState } from "react";

export default function OnboardingCard({ user }: any) {
  const [linkedinConnected, setLinkedinConnected] = useState(false);

  const [campaignCreated, setCampaignCreated] = useState(true); // you already created campaigns

  const completed = Number(linkedinConnected) + Number(campaignCreated);

  return (
    <div className="bg-white border rounded-xl p-6 mb-6">
      {/* Header */}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Progress Circle */}

          <div className="w-10 h-10 rounded-full border flex items-center justify-center text-sm font-semibold">
            {completed}/2
          </div>

          <div>
            <h2 className="font-semibold text-lg">
              Let's get started {user?.name || "User"} 👋
            </h2>

            <p className="text-sm text-gray-500">
              Follow these steps to get the most out of our features.
            </p>
          </div>
        </div>
      </div>

      {/* Step 1 — LinkedIn */}

      <div className="border rounded-lg p-4 flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
            in
          </div>

          <div>
            <div className="font-medium">Connect your LinkedIn account</div>

            <div className="text-sm text-gray-500">
              Unlock most powerful features by connecting your account
            </div>
          </div>
        </div>

        <button
          onClick={() => setLinkedinConnected(true)}
          className="border px-4 py-2 rounded-lg"
        >
          + Connect now
        </button>
      </div>

      {/* Step 2 — Campaign */}

      <div className="border rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            ✓
          </div>

          <div>
            <div className="font-medium">Create a campaign</div>

            <div className="text-sm text-gray-500">
              Import or find leads and create a sequence to book meetings
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
