export default function CampaignHeader() {
  return (
    <div className="bg-white border border-[#ececf4] rounded-xl px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold">abcd</h1>

        <span className="px-3 py-1 rounded-lg bg-violet-100 text-violet-700 text-sm font-medium">
          Pending
        </span>
      </div>

      <div className="w-10 h-10 rounded-full bg-violet-500 text-white flex items-center justify-center font-semibold">
        YD
      </div>
    </div>
  );
}
