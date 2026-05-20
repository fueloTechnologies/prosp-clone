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
import OnboardingCard from "@/components/dashboard/OnboardingCard";

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
  const [linkedinConnected, setLinkedinConnected] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [hasLinkedin, setHasLinkedin] = useState(false);
  const [hasCampaigns, setHasCampaigns] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState("");

  const [timeFilter, setTimeFilter] = useState("all");

  const filteredPerformance =
    selectedCampaign === ""
      ? campaignPerformance
      : campaignPerformance.filter(
          (row: any) =>
            row.campaign ===
            campaigns.find((c: any) => c.id === selectedCampaign)?.name,
        );

  /* Fetch Stats */

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((res) => res.json())
      .then((data) => setStats(data));
  }, []);

  /* Fetch Campaign Performance */

  useEffect(() => {
    fetch("/api/dashboard/campaign-performance")
      .then((res) => res.json())
      .then((data) => setCampaignPerformance(data));
  }, []);

  /* Fetch Campaigns for dropdown */
  /* Fetch Campaigns for dropdown */
  useEffect(() => {
    async function loadCampaigns() {
      try {
        const res = await fetch("/api/campaigns");

        const data = await res.json();

        if (Array.isArray(data)) {
          setCampaigns(data);

          setHasCampaigns(data.length > 0);
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadCampaigns();
  }, []);
  /* Check LinkedIn Connection */

  useEffect(() => {
    fetch("/api/linkedin/status")
      .then((res) => res.json())
      .then((data) => {
        if (data.connected) {
          setHasLinkedin(true);
        }
      });
  }, []);
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
      });
  }, []);
  /* Export CSV */

  function handleExport() {
    if (!campaignPerformance.length) return;

    const headers = "Campaign,Connections,Conversations,ReplyRate\n";

    const rows = campaignPerformance
      .map(
        (row) =>
          `${row.campaign},${row.connections},${row.conversations},${row.replyRate}%`,
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = "analytics.csv";
    a.click();
  }

  return (
    <AppShell activeTab="dashboard">
      {/* LinkedIn Section */}
      <div
        className="
bg-white
border
border-[#ececf4]
rounded-[28px]
p-8
mb-6
shadow-sm
"
      >
        <h2 className="text-lg font-semibold">
          Let's get started {user?.name || "User"} 👋
        </h2>

        <p className="text-sm text-gray-500">
          Follow these steps to get the most out of our features
        </p>

        <div
          className="
border
border-[#ececf4]
rounded-2xl
p-5
mt-4
flex
justify-between
items-center
hover:shadow-md
transition-all
duration-200
"
        >
          <div>
            <h3 className="font-medium">Connect your LinkedIn account</h3>

            <p className="text-sm text-gray-500">
              Unlock most powerful features
            </p>
          </div>
          <button
            onClick={() => {
              window.location.href = "/settings";
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-2 transition"
          >
            + Connect now
          </button>{" "}
        </div>

        <div
          className="
border
border-[#ececf4]
rounded-2xl
p-5
mt-4
flex
justify-between
items-center
hover:shadow-md
transition-all
duration-200
"
        >
          <div>
            <h3 className="font-medium">Create a campaign</h3>

            <p className="text-sm text-gray-500">
              Import leads and create a sequence
            </p>
          </div>
          <button
            onClick={() => {
              window.location.href = "/sequences";
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-2 transition"
          >
            Create Campaign
          </button>
        </div>
      </div>
      {/* Analytics Section — MOVED INSIDE */}
      <div className="px-6 py-6">
        {/* Header */}

        <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
          <div>
            <h1 className="text-xl font-semibold">Analytics</h1>

            <p className="text-sm text-gray-500">
              Monitor the results of your campaign
            </p>
          </div>

          {/* Buttons — FIXED */}

          <div className="flex flex-wrap gap-2">
            {/* Time Filter */}

            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="
bg-white
border
border-[#ececf4]
rounded-xl
px-4
py-3
text-sm
outline-none
focus:ring-4
focus:ring-violet-100
"
            >
              <option value="all">All Time</option>

              <option value="week">This Week</option>

              <option value="month">This Month</option>
            </select>

            {/* Campaign Filter */}

            <select
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              className="
bg-white
border
border-[#ececf4]
rounded-xl
px-4
py-3
text-sm
min-w-[220px]
outline-none
focus:ring-4
focus:ring-violet-100
"
            >
              <option value="">Select Campaigns</option>

              {campaigns.length > 0 &&
                campaigns.map((c: any, index: number) => {
                  const name = c.name || c.campaign || `Campaign ${index + 1}`;

                  return (
                    <option key={c.id || index} value={c.id}>
                      {name}
                    </option>
                  );
                })}
            </select>

            {/* Export */}

            <button
              onClick={handleExport}
              className="
border
border-[#ececf4]
rounded-xl
px-5
py-3
text-sm
font-medium
hover:bg-[#f8f8fc]
transition-all
"
            >
              Export
            </button>
          </div>
        </div>

        {/* Stats */}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5 mb-6">
          <StatCard title="Connections" value={stats.connections} />

          <StatCard title="Conversations" value={stats.conversations} />

          <StatCard title="Engagements" value={stats.engagements} />

          <StatCard title="InMails" value={stats.inmails} />

          <StatCard title="Tags" value={stats.tags} />
        </div>

        {/* Charts */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <ConnectionsChart
            campaignId={selectedCampaign}
            timeFilter={timeFilter}
          />

          <ConversationsChart
            campaignId={selectedCampaign}
            timeFilter={timeFilter}
          />
        </div>

        {/* NEW Reply Rate Chart */}

        <div className="mb-6">
          <ReplyRateChart />
        </div>

        {/* campaign funnel */}

        <div className="mb-6">
          <CampaignFunnel />
        </div>

        {/* Campaign Success Score */}

        <div className="mb-6">
          <CampaignSuccessScore />
        </div>

        {/* Conversion Rate */}

        <div className="mb-6">
          <ConversionRateWidget />
        </div>

        {/* Campaign Health Score */}

        <div className="mb-6">
          <CampaignHealthScore />
        </div>

        {/* Meeting Conversion Rate */}

        <div className="mb-6">
          <MeetingConversionRate />
        </div>

        {/* Campaign Comparison */}
        <CampaignComparison />

        {/* Reply Time Analytics */}
        <ReplyTimeWidget />

        {/* Campaign Alerts */}
        <CampaignAlerts />

        {/* Campaign Timeline */}
        <CampaignTimeline />

        {/* AI KPI Insights */}
        <AIKPIWidget />

        {/* Message Performance */}

        <div className="mb-6">
          <MessagePerformance />
        </div>

        {/* Sequence Performance */}

        <div className="mb-6">
          <SequencePerformance />
        </div>

        {/* Best Performing Step */}

        <div className="mb-6">
          <BestPerformingStep />
        </div>

        {/* Daily Outreach Activity */}

        <div className="mb-6">
          <DailyActivity />
        </div>

        {/* Reply Rate Trend */}

        <div className="mb-6">
          <ReplyRateTrend />
        </div>

        {/* Lead Status Distribution */}

        <div className="mb-6">
          <LeadStatusDistribution />
        </div>

        {/* Activity Timeline */}

        <div className="mb-6">
          <ActivityTimeline />
        </div>

        {/* Campaign Table */}

        <div
          className="
bg-white
rounded-[28px]
border
border-[#ececf4]
p-8
shadow-sm
"
        >
          <h2 className="font-semibold mb-4">
            Campaign Performance
            <div className="mt-6">
              <CampaignLeaderboard />
            </div>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-[#ececf4]">
                  <th className="pb-2">Campaign</th>

                  <th className="pb-2">Connections</th>

                  <th className="pb-2">Conversations</th>

                  <th className="pb-2">Reply Rate</th>
                </tr>
              </thead>

              <tbody>
                {filteredPerformance.map((row, index) => (
                  <tr
                    key={index}
                    className="
  border-b
  border-[#f1f1f5]
  hover:bg-[#fafafe]
  transition-all
"
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

/* Stat Card */

function StatCard({ title, value }: any) {
  return (
    <div
      className="
      bg-white
      border
      border-[#ececf4]
      rounded-[24px]
      p-6
      hover:shadow-lg
      transition-all
      duration-300
    "
    >
      <p className="text-sm text-gray-500 font-medium">{title}</p>

      <h3
        className="
        text-4xl
        font-bold
        mt-3
        tracking-tight
        text-[#111827]
      "
      >
        {value}
      </h3>
    </div>
  );
}
