"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import CampaignFunnel from "@/components/dashboard/FunnelChart";
import ConnectionsChart from "@/components/dashboard/ConnectionsChart";
import ConversationsChart from "@/components/dashboard/ConversationsChart";
import CampaignLeaderboard from "@/components/dashboard/CampaignLeaderboard";
import ReplyRateChart from "@/components/dashboard/ReplyRateChart";
import CampaignSuccessScore from "@/components/dashboard/CampaignSuccessScore";
import ActivityTimeline from "@/components/dashboard/ActivityTimeline";
import ConversionRateWidget from "@/components/dashboard/ConversionRateWidget";
import MessagePerformance from "@/components/dashboard/MessagePerformance";
import SequencePerformance from "@/components/dashboard/SequencePerformance";
import DailyActivity from "@/components/dashboard/DailyActivity";
import LeadStatusDistribution from "@/components/dashboard/LeadStatusDistribution";
import ReplyRateTrend from "@/components/dashboard/ReplyRateTrend";
import CampaignHealthScore from "@/components/dashboard/CampaignHealthScore";
import BestPerformingStep from "@/components/dashboard/BestPerformingStep";
import MeetingConversionRate from "@/components/dashboard/MeetingConversionRate";
import CampaignComparison from "@/components/dashboard/CampaignComparison";
import ReplyTimeWidget from "@/components/dashboard/ReplyTimeWidget";
import CampaignAlerts from "@/components/dashboard/CampaignAlerts";
import CampaignTimeline from "@/components/dashboard/CampaignTimeline";
import AIKPIWidget from "@/components/dashboard/AIKPIWidget";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    connections: 0,
    conversations: 0,
    engagements: 0,
    inmails: 0,
    tags: 0,
  });
  const [campaignPerformance, setCampaignPerformance] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [hasLinkedin, setHasLinkedin] = useState(false);
  const [hasCampaigns, setHasCampaigns] = useState(false);
  const [onboardingCollapsed, setOnboardingCollapsed] = useState(false);
  const [onboardingLoaded, setOnboardingLoaded] = useState(false); // wait before rendering
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");

  const completedSteps = [hasLinkedin, hasCampaigns].filter(Boolean).length;
  const totalSteps = 2;

  const filteredPerformance =
    selectedCampaign === ""
      ? campaignPerformance
      : campaignPerformance.filter(
          (row: any) =>
            row.campaign ===
            campaigns.find((c: any) => c.id === selectedCampaign)?.name,
        );

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
    fetch("/api/dashboard/campaign-performance")
      .then((r) => r.json())
      .then(setCampaignPerformance)
      .catch(() => {});
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then(setUser)
      .catch(() => {});

    // Load both onboarding checks together, mark loaded only when both resolve
    Promise.allSettled([
      fetch("/api/linkedin/status")
        .then((r) => r.json())
        .then((d) => {
          if (d.connected) setHasLinkedin(true);
        }),
      fetch("/api/campaigns")
        .then((r) => r.json())
        .then((d) => {
          if (Array.isArray(d)) {
            setCampaigns(d);
            setHasCampaigns(d.length > 0);
          }
        }),
    ]).finally(() => setOnboardingLoaded(true)); // only NOW show the card
  }, []);

  function handleExport() {
    if (!campaignPerformance.length) return;
    const headers = "Campaign,Connections,Conversations,ReplyRate\n";
    const rows = campaignPerformance
      .map(
        (r) =>
          `${r.campaign},${r.connections},${r.conversations},${r.replyRate}%`,
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "analytics.csv";
    a.click();
  }

  return (
    <AppShell activeTab="dashboard">
      <div className="px-8 py-6 space-y-6">
        {/* ── Onboarding card — matches Prosp.ai exactly ── */}
        {onboardingLoaded && completedSteps < totalSteps && (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5">
              <div className="flex items-center gap-4">
                {/* Progress ring */}
                <div className="relative w-11 h-11 flex-shrink-0">
                  <svg className="w-11 h-11 -rotate-90" viewBox="0 0 44 44">
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      fill="none"
                      stroke="#ede9fe"
                      strokeWidth="3.5"
                    />
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      fill="none"
                      stroke="#7c3aed"
                      strokeWidth="3.5"
                      strokeDasharray={`${(completedSteps / totalSteps) * 113} 113`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-violet-700">
                    {completedSteps}/{totalSteps}
                  </span>
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">
                    Let's get started {user?.name?.split(" ")[0] || ""} 👋
                  </h2>
                  <p className="text-sm text-gray-400 mt-0.5">
                    Follow these steps to get the most out of Prosp
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOnboardingCollapsed(!onboardingCollapsed)}
                className="text-gray-400 hover:text-gray-600 transition p-1"
              >
                <svg
                  className={`w-5 h-5 transition-transform ${onboardingCollapsed ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>

            {/* Steps */}
            {!onboardingCollapsed && (
              <div className="px-6 pb-5 space-y-2">
                {/* Step 1 — LinkedIn */}
                <div
                  onClick={() =>
                    !hasLinkedin && (window.location.href = "/settings")
                  }
                  className={`flex items-center justify-between border border-gray-100 rounded-2xl px-5 py-4 hover:shadow-sm transition-all ${!hasLinkedin ? "hover:border-violet-200 cursor-pointer" : ""}`}
                >
                  <div className="flex items-center gap-4">
                    {hasLinkedin ? (
                      <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-4 h-4 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Connect your LinkedIn account
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Unlock Prosp most powerful features by connecting your
                        account
                      </p>
                    </div>
                  </div>
                  {!hasLinkedin && (
                    <button
                      onClick={() => (window.location.href = "/settings")}
                      className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-violet-300 hover:bg-violet-50 transition"
                    >
                      + Connect now
                    </button>
                  )}
                </div>

                {/* Step 2 — Campaign */}
                <div
                  onClick={() => (window.location.href = "/sequences")}
                  className="flex items-center justify-between border border-gray-100 rounded-2xl px-5 py-4 hover:shadow-sm hover:border-violet-200 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-4">
                    {hasCampaigns ? (
                      <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-4 h-4 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center flex-shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Create a campaign
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Import or find leads and create a sequence to book
                        meetings
                      </p>
                    </div>
                  </div>
                  {!hasCampaigns && (
                    <button
                      onClick={() => (window.location.href = "/sequences")}
                      className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-violet-300 hover:bg-violet-50 transition"
                    >
                      Create Campaign
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Analytics header ── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Analytics</h1>
            <p className="text-sm text-gray-400">
              Monitor the results of your campaign
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-200"
            >
              <option value="all">All Time</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <select
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm min-w-[200px] outline-none focus:ring-2 focus:ring-violet-200"
            >
              <option value="">Select Campaigns</option>
              {campaigns.map((c: any, i: number) => (
                <option key={c.id || i} value={c.id}>
                  {c.name || `Campaign ${i + 1}`}
                </option>
              ))}
            </select>
            <button
              onClick={handleExport}
              className="border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium hover:bg-gray-50 transition"
            >
              Export
            </button>
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {[
            ["Connections", stats.connections],
            ["Conversations", stats.conversations],
            ["Engagements", stats.engagements],
            ["InMails", stats.inmails],
            ["Tags", stats.tags],
          ].map(([title, value]) => (
            <div
              key={String(title)}
              className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-all"
            >
              <p className="text-sm text-gray-400 font-medium">{title}</p>
              <p className="text-4xl font-bold mt-2 text-gray-900 tracking-tight">
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Charts grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <ConnectionsChart
            campaignId={selectedCampaign}
            timeFilter={timeFilter}
          />
          <ConversationsChart
            campaignId={selectedCampaign}
            timeFilter={timeFilter}
          />
        </div>

        <ReplyRateChart />
        <CampaignFunnel />
        <CampaignSuccessScore />
        <ConversionRateWidget />
        <CampaignHealthScore />
        <MeetingConversionRate />
        <CampaignComparison />
        <ReplyTimeWidget />
        <CampaignAlerts />
        <CampaignTimeline />
        <AIKPIWidget />
        <MessagePerformance />
        <SequencePerformance />
        <BestPerformingStep />
        <DailyActivity />
        <ReplyRateTrend />
        <LeadStatusDistribution />
        <ActivityTimeline />

        {/* ── Campaign performance table ── */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">
            Campaign Performance
          </h2>
          <CampaignLeaderboard />
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-100 text-gray-400">
                  <th className="pb-2 font-medium">Campaign</th>
                  <th className="pb-2 font-medium">Connections</th>
                  <th className="pb-2 font-medium">Conversations</th>
                  <th className="pb-2 font-medium">Reply Rate</th>
                </tr>
              </thead>
              <tbody>
                {filteredPerformance.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-50 hover:bg-gray-50 transition"
                  >
                    <td className="py-2">{row.campaign}</td>
                    <td>{row.connections}</td>
                    <td>{row.conversations}</td>
                    <td>{row.replyRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
