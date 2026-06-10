"use client";

import AppShell from "@/components/layout/AppShell";
import CampaignHeader from "@/components/sequences/CampaignHeader";
import CampaignTabs from "@/components/sequences/CampaignTabs";

export default function CampaignPage() {
  return (
    <AppShell activeTab="campaigns">
      <div className="space-y-4">
        <CampaignHeader />
        <CampaignTabs />
      </div>
    </AppShell>
  );
}
