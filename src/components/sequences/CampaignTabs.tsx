"use client";
// src/components/sequences/CampaignTabs.tsx

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import AddContactModal from "../leads/AddContactModal";
import ImportContactsModal from "@/components/leads/ImportContactsModal";

export default function CampaignTabs() {
  const params = useParams();
  const campaignId = params?.id as string; // ✅ gets campaignId from URL /campaigns/[id]

  const [activeTab, setActiveTab] = useState("leads");
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);

  const tabs = ["Leads", "Builder", "Analytics", "Settings"];

  /* Load contacts for this campaign */
  const loadContacts = async () => {
    if (!campaignId) return;
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/contacts`);
      const data = await res.json();
      if (Array.isArray(data)) setContacts(data);
    } catch (err) {
      console.error("Contacts load error:", err);
    }
  };

  useEffect(() => {
    loadContacts();
    const interval = setInterval(loadContacts, 5000);
    return () => clearInterval(interval);
  }, [campaignId]);

  return (
    <div className="bg-white border border-[#ececf4] rounded-2xl overflow-hidden">
      {/* TOP BAR */}
      <div className="flex items-center justify-between border-b border-[#ececf4] px-6 h-16">
        <div className="flex items-center gap-8 h-full">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`h-full text-sm font-medium border-b-2 transition-all ${
                activeTab === tab.toLowerCase()
                  ? "border-violet-600 text-violet-600"
                  : "border-transparent text-gray-500 hover:text-[#111827]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "leads" && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2 rounded-xl border border-[#ececf4] bg-white hover:bg-gray-50 text-sm font-medium"
            >
              Import Contacts
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium"
            >
              Add Contact
            </button>
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-6">
        {activeTab === "leads" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-[#111827]">
                Contacts
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {contacts.length} contact{contacts.length !== 1 ? "s" : ""} in
                this campaign
              </p>
            </div>

            {contacts.length === 0 ? (
              <div className="border border-dashed border-[#d7d7e4] rounded-2xl py-24 flex flex-col items-center justify-center text-center">
                <h2 className="text-2xl font-semibold text-[#111827]">
                  No contacts yet
                </h2>
                <p className="text-gray-500 mt-2 max-w-md">
                  Import leads from LinkedIn, CSV, or manually add contacts.
                </p>
                <div className="flex items-center gap-3 mt-6">
                  <button
                    onClick={() => setShowImportModal(true)}
                    className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-3 rounded-xl font-medium"
                  >
                    Import Contacts
                  </button>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="border border-[#ececf4] px-5 py-3 rounded-xl font-medium hover:bg-gray-50"
                  >
                    Add Manually
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-[#ececf4] rounded-2xl overflow-hidden">
                {/* TABLE HEADER */}
                <div className="grid grid-cols-6 px-6 py-4 border-b border-[#ececf4] text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <div>Name</div>
                  <div>Company</div>
                  <div>Position</div>
                  <div>Email</div>
                  <div>Status</div>
                  <div>Actions</div>
                </div>
                {/* ROWS */}
                {contacts.map((contact: any) => (
                  <div
                    key={contact.id}
                    className="grid grid-cols-6 px-6 py-4 border-b border-[#f4f4f5] items-center text-sm"
                  >
                    <div className="font-medium text-[#111827]">
                      {contact.contact?.firstName ?? contact.firstName}{" "}
                      {contact.contact?.lastName ?? contact.lastName}
                    </div>
                    <div>
                      {contact.contact?.company ?? contact.company ?? "-"}
                    </div>
                    <div>
                      {contact.contact?.position ?? contact.position ?? "-"}
                    </div>
                    <div>{contact.contact?.email ?? contact.email ?? "-"}</div>
                    <div>
                      <span className="px-2 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-medium">
                        {contact.status ?? "Pending"}
                      </span>
                    </div>
                    <div>
                      <button className="text-red-500 hover:text-red-600 text-sm">
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "builder" && (
          <div className="py-20 text-center text-gray-500">
            Sequence Builder Coming Soon
          </div>
        )}
        {activeTab === "analytics" && (
          <div className="py-20 text-center text-gray-500">
            Analytics Coming Soon
          </div>
        )}
        {activeTab === "settings" && (
          <div className="py-20 text-center text-gray-500">
            Campaign Settings Coming Soon
          </div>
        )}
      </div>

      {/* ✅ UNIFIED IMPORT MODAL */}
      {showImportModal && campaignId && (
        <ImportContactsModal
          campaignId={campaignId}
          onClose={() => setShowImportModal(false)}
          onImported={async (count) => {
            // Refresh contacts live — user closes modal manually
            console.log(`✅ Live count update: ${count} contacts`);
            await loadContacts();
          }}
        />
      )}

      {showAddModal && (
        <AddContactModal
          onClose={() => setShowAddModal(false)}
          onAdded={(contact: any) => {
            setContacts((prev) => [contact, ...prev]);
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}
