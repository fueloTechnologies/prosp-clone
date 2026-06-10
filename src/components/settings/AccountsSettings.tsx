"use client";

import { Linkedin, Trash2 } from "lucide-react";

interface Props {
  accounts: any[];
  loading: boolean;
  showDropdown: boolean;
  setShowDropdown: any;
  connectionMethods: any[];
  toggleStatus: any;
  deleteAccount: any;
  setModal: any;
}

export default function AccountsSettings({
  accounts,
  loading,
  showDropdown,
  setShowDropdown,
  connectionMethods,
  toggleStatus,
  deleteAccount,
  setModal,
}: Props) {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">LinkedIn Accounts</h1>

        <p className="text-gray-500 mt-1">
          Connect your LinkedIn account to automate outreach
        </p>
      </div>

      {/* Account list */}
      {loading ? (
        <div className="text-gray-400 text-sm">Loading...</div>
      ) : accounts.length > 0 ? (
        <div className="space-y-4 mb-8">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="flex items-center justify-between px-6 py-5 rounded-3xl border border-white/60 bg-white/80 backdrop-blur-xl shadow-sm hover:shadow-xl hover:shadow-purple-100/40 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg">
                  <Linkedin size={20} className="text-white" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{acc.name}</p>

                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 border border-violet-200">
                      Premium
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <p className="text-xs text-gray-400 truncate max-w-[200px]">
                      {acc.profileUrl || "Connected"}
                    </p>

                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                      {acc.proxy || "Residential Proxy"}
                    </span>

                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      Limit: {acc.dailyLimit}/day
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap justify-end">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${
                    acc.status === "ACTIVE"
                      ? "bg-green-50 border-green-200"
                      : "bg-amber-50 border-amber-200"
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                      acc.status === "ACTIVE" ? "bg-green-500" : "bg-amber-500"
                    }`}
                  />

                  <span
                    className={`text-xs font-medium ${
                      acc.status === "ACTIVE"
                        ? "text-green-700"
                        : "text-amber-700"
                    }`}
                  >
                    {acc.status === "ACTIVE"
                      ? "Active"
                      : acc.status === "WARMING"
                        ? "Warming"
                        : "Paused"}
                  </span>
                </div>

                <div className="hidden md:flex items-center gap-1.5">
                  <span className="text-[10px] px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                    Stealth Mode
                  </span>

                  <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                    Session Saved
                  </span>

                  <span className="text-[10px] px-2 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100">
                    Random Delays
                  </span>
                </div>

                <button
                  onClick={() => toggleStatus(acc.id, acc.status)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                    acc.status === "ACTIVE"
                      ? "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                      : "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                  }`}
                >
                  {acc.status === "ACTIVE" ? "Pause" : "Start"}
                </button>

                <button
                  onClick={() => deleteAccount(acc.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mb-8 p-10 border-2 border-dashed border-gray-200 rounded-2xl text-center">
          <Linkedin size={32} className="text-gray-300 mx-auto mb-3" />

          <p className="text-gray-500 font-medium">
            No LinkedIn account connected
          </p>

          <p className="text-gray-400 text-sm mt-1">
            Connect your account to start automating outreach
          </p>
        </div>
      )}

      {/* Add button */}
      <div className="relative inline-block">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium text-sm transition"
        >
          <Linkedin size={16} />
          Add a LinkedIn account
          <span className="ml-1 text-purple-300">▾</span>
        </button>

        {showDropdown && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowDropdown(false)}
            />

            <div className="absolute left-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-2xl shadow-xl z-20 overflow-hidden">
              {connectionMethods.map((method) => (
                <button
                  key={String(method.key)}
                  onClick={() => {
                    setModal(method.key);
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition text-left border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                      <method.icon size={15} className="text-purple-600" />
                    </div>

                    <span className="text-sm font-medium text-gray-800">
                      {method.label}
                    </span>
                  </div>

                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                    {method.badge}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
