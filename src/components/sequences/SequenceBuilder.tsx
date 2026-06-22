"use client";
// src/components/sequences/SequenceBuilder.tsx

import { useEffect, useState, useRef, useCallback } from "react";
import StepTypePicker from "./StepTypePicker";
import { replaceVariables } from "@/lib/variables";
import CampaignSettingsModal from "./CampaignSettingsModal";
import ImportContactsModal from "@/components/leads/ImportContactsModal";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

type Step = {
  id: string;
  type: string;
  content: string;
  subject?: string;
  delay?: number;
};

const STEP_ICONS: Record<string, string> = {
  CONNECTION_REQUEST: "🔗",
  MESSAGE: "📩",
  FOLLOW_UP: "💬",
  EMAIL: "📧",
  WAIT: "⏳",
};

const STEP_COLORS: Record<string, string> = {
  CONNECTION_REQUEST: "bg-violet-50 border-violet-200",
  MESSAGE: "bg-blue-50 border-blue-200",
  FOLLOW_UP: "bg-indigo-50 border-indigo-200",
  EMAIL: "bg-amber-50 border-amber-200",
  WAIT: "bg-gray-50 border-gray-200",
};

const STEP_BADGE: Record<string, string> = {
  CONNECTION_REQUEST: "bg-violet-100 text-violet-700",
  MESSAGE: "bg-blue-100 text-blue-700",
  FOLLOW_UP: "bg-indigo-100 text-indigo-700",
  EMAIL: "bg-amber-100 text-amber-700",
  WAIT: "bg-gray-100 text-gray-600",
};

export default function SequenceBuilder({
  campaign,
  onUpdate,
  showImportModal,
  setShowImportModal,
}: {
  campaign: any;
  onUpdate: (updated: any) => void;
  showImportModal: boolean;
  setShowImportModal: (value: boolean) => void;
}) {
  const [steps, setSteps] = useState<Step[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [campaignContacts, setCampaignContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [savingSteps, setSavingSteps] = useState<Record<string, boolean>>({});

  // ✅ FIX: debounce timers per step to avoid API spam on every keystroke
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>(
    {},
  );

  /* =========================
     LOAD STEPS
  ========================== */
  const loadSteps = async () => {
    if (!campaign?.id) {
      setSteps([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`/api/campaigns/${campaign.id}/steps`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const sorted = data.sort(
          (a: any, b: any) => (a.order || 0) - (b.order || 0),
        );
        setSteps(sorted);
      } else {
        setSteps([]);
      }
    } catch (err) {
      console.error("Steps load error:", err);
      setSteps([]);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     LOAD CONTACTS
  ========================== */
  const loadContacts = async () => {
    if (!campaign?.id) return;
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}/contacts`);
      const data = await res.json();
      if (Array.isArray(data)) setCampaignContacts(data);
    } catch (err) {
      console.error("Contacts load error:", err);
    }
  };

  const loadActivity = async () => {
    if (!campaign?.id) return;
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}/activity`);
      const data = await res.json();
      if (Array.isArray(data)) setActivity(data);
    } catch (err) {
      console.error("Activity load error:", err);
    }
  };

  /* =========================
     INITIAL LOAD
  ========================== */
  useEffect(() => {
    if (!campaign?.id) return;
    loadSteps();
    loadContacts();
    loadActivity();
    const interval = setInterval(() => {
      loadContacts();
      loadActivity();
    }, 5000);
    return () => clearInterval(interval);
  }, [campaign?.id]);

  /* =========================
     DRAG HANDLER
  ========================== */
  const onDragEnd = async (result: any) => {
    if (!result.destination) return;
    const items = Array.from(steps);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setSteps(items);
    await fetch("/api/steps/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        steps: items.map((step, index) => ({ id: step.id, order: index + 1 })),
      }),
    });
  };

  /* =========================
     ADD STEP
  ========================== */
  const addStep = async (type: string) => {
    if (!campaign?.id) return;
    try {
      await fetch(`/api/campaigns/${campaign.id}/steps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          content:
            type === "WAIT"
              ? ""
              : "hi {{firstName}} {{lastName}} from {{company}} — {{position}}",
          subject: type === "EMAIL" ? "Following up, {{firstName}}" : null,
          delay: type === "WAIT" ? 1 : 0,
        }),
      });
      await loadSteps();
    } catch (error) {
      console.error("Add step error:", error);
    }
  };

  /* =========================
     REMOVE CONTACT
  ========================== */
  const removeContact = async (contactId: string) => {
    if (!confirm("Remove this contact from the campaign?")) return;
    try {
      await fetch(`/api/campaigns/${campaign.id}/contacts`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId }),
      });
      await loadContacts();
    } catch (err) {
      console.error("Remove contact error:", err);
    }
  };

  /* =========================
     UPDATE STEP (debounced) ✅ FIXED
  ========================== */
  const updateStepDebounced = useCallback(
    (stepId: string, data: Partial<Step>) => {
      // Update local state immediately for responsive UI
      setSteps((prev) =>
        prev.map((s) => (s.id === stepId ? { ...s, ...data } : s)),
      );

      // Debounce the API call — wait 600ms after last keystroke
      if (debounceTimers.current[stepId]) {
        clearTimeout(debounceTimers.current[stepId]);
      }

      setSavingSteps((prev) => ({ ...prev, [stepId]: true }));

      debounceTimers.current[stepId] = setTimeout(async () => {
        try {
          await fetch(`/api/campaigns/${campaign.id}/steps/${stepId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
        } catch (error) {
          console.error("Update step error:", error);
        } finally {
          setSavingSteps((prev) => ({ ...prev, [stepId]: false }));
        }
      }, 600);
    },
    [campaign?.id],
  );

  /* =========================
     DELETE STEP
  ========================== */
  const deleteStep = async (id: string) => {
    try {
      await fetch(`/api/campaigns/${campaign.id}/steps/${id}`, {
        method: "DELETE",
      });
      await loadSteps();
    } catch (error) {
      console.error("Delete step error:", error);
    }
  };

  /* =========================
     LAUNCH CAMPAIGN
  ========================== */
  const launchCampaign = async () => {
    if (!campaign?.id) return;
    if (
      !confirm(
        "Launch this campaign? All contacts will start receiving messages.",
      )
    )
      return;
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}/launch`, {
        method: "POST",
      });
      if (res.ok) {
        alert("Campaign Launched 🚀");
        onUpdate?.({ ...campaign, status: "ACTIVE" });
      } else {
        alert("Launch failed. Please try again.");
      }
    } catch (error) {
      console.error("Launch error:", error);
    }
  };

  /* =========================
     GET PREVIEW CONTACT
  ========================== */
  const previewContact =
    campaignContacts.length > 0
      ? campaignContacts[previewIndex]?.contact
      : {
          firstName: "John",
          lastName: "Doe",
          company: "Acme Corp",
          position: "CEO",
        };

  if (loading && steps.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-sm text-gray-400">Loading steps...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#fafafe] p-8">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            {campaign?.name}
          </h2>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-sm text-gray-500">
              {campaignContacts.length} contact
              {campaignContacts.length !== 1 ? "s" : ""}
            </p>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                campaign?.status === "ACTIVE"
                  ? "bg-green-100 text-green-700"
                  : campaign?.status === "PAUSED"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-600"
              }`}
            >
              {campaign?.status || "DRAFT"}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="h-9 px-4 rounded-xl border border-[#ececf4] bg-white hover:bg-[#fafafe] transition-all text-sm font-medium text-gray-700"
          >
            + Add Contacts
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="h-9 px-4 rounded-xl border border-[#ececf4] bg-white hover:bg-[#fafafe] transition-all text-sm font-medium text-gray-700"
          >
            ⚙ Settings
          </button>
          <button
            onClick={launchCampaign}
            className="h-9 px-4 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-sm font-semibold shadow-md shadow-violet-500/20 hover:opacity-90 transition-all duration-200"
          >
            🚀 Launch
          </button>
        </div>
      </div>

      {/* CONTACTS LIST */}
      {campaignContacts.length > 0 && (
        <div className="mb-8 border border-[#ececf4] rounded-2xl bg-white overflow-hidden">
          <div className="px-4 py-3 border-b border-[#ececf4] flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">
              Contacts
            </span>
            <span className="text-xs text-gray-400">
              {campaignContacts.length} total
            </span>
          </div>
          <div className="divide-y divide-[#f4f4f8] max-h-48 overflow-y-auto">
            {campaignContacts.map((cc: any) => (
              <div
                key={cc.id}
                className="flex items-center justify-between px-4 py-2.5 hover:bg-[#fafafe] group"
              >
                <div className="flex items-center gap-3">
                  {cc.contact?.avatar ? (
                    <img
                      src={cc.contact.avatar}
                      className="w-7 h-7 rounded-full object-cover"
                      alt=""
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-xs font-semibold text-violet-600">
                      {cc.contact?.firstName?.[0]}
                      {cc.contact?.lastName?.[0]}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium text-gray-800">
                      {cc.contact?.firstName} {cc.contact?.lastName}
                    </div>
                    <div className="text-xs text-gray-400">
                      {cc.contact?.company || cc.contact?.position || ""}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium
                    ${cc.status === "COMPLETED" ? "bg-green-100 text-green-700" : ""}
                    ${cc.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-700" : ""}
                    ${cc.status === "PENDING" ? "bg-yellow-100 text-yellow-700" : ""}
                    ${cc.status === "REPLIED" ? "bg-purple-100 text-purple-700" : ""}
                    ${cc.status === "BOUNCED" ? "bg-red-100 text-red-700" : ""}
                  `}
                  >
                    {cc.status}
                  </span>
                  <button
                    onClick={() => removeContact(cc.contact.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-500 p-1 rounded text-xs"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEPS */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="steps">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-3"
            >
              {steps.map((step, index) => (
                <Draggable key={step.id} draggableId={step.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`transition-shadow ${snapshot.isDragging ? "shadow-xl" : ""}`}
                    >
                      {/* Drag handle */}
                      <div
                        {...provided.dragHandleProps}
                        className="cursor-grab active:cursor-grabbing flex items-center gap-1 text-xs text-gray-300 hover:text-gray-400 mb-1 select-none w-fit"
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="currentColor"
                        >
                          <circle cx="3" cy="3" r="1.2" />
                          <circle cx="9" cy="3" r="1.2" />
                          <circle cx="3" cy="6" r="1.2" />
                          <circle cx="9" cy="6" r="1.2" />
                          <circle cx="3" cy="9" r="1.2" />
                          <circle cx="9" cy="9" r="1.2" />
                        </svg>
                        Drag
                      </div>

                      <div
                        className={`border rounded-2xl p-5 bg-white transition-all ${
                          STEP_COLORS[step.type] || "border-gray-200"
                        }`}
                      >
                        {/* Step header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {STEP_ICONS[step.type] || "⚡"}
                            </span>
                            <span
                              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                STEP_BADGE[step.type] ||
                                "bg-gray-100 text-gray-600"
                              }`}
                            >
                              Step {index + 1} — {step.type.replace(/_/g, " ")}
                            </span>
                            {savingSteps[step.id] && (
                              <span className="text-xs text-gray-400 animate-pulse">
                                Saving…
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => deleteStep(step.id)}
                            className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>

                        {/* WAIT step */}
                        {step.type === "WAIT" ? (
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600">Wait</span>
                            <input
                              type="number"
                              min={0}
                              value={step.delay ?? 1}
                              onChange={(e) => {
                                const value = Number(e.target.value);
                                updateStepDebounced(step.id, { delay: value });
                              }}
                              className="w-20 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-violet-300"
                            />
                            <span className="text-sm text-gray-600">hours</span>
                          </div>
                        ) : (
                          <>
                            {/* Variable chips */}
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {[
                                "firstName",
                                "lastName",
                                "company",
                                "position",
                              ].map((variable) => (
                                <button
                                  key={variable}
                                  type="button"
                                  onClick={() => {
                                    const newContent =
                                      (step.content || "") + ` {{${variable}}}`;
                                    updateStepDebounced(step.id, {
                                      content: newContent,
                                    });
                                  }}
                                  className="text-xs px-2.5 py-1 border border-gray-200 rounded-full bg-white hover:bg-violet-50 hover:border-violet-300 hover:text-violet-700 transition-colors"
                                >
                                  {variable}
                                </button>
                              ))}
                            </div>

                            {/* EMAIL subject field */}
                            {step.type === "EMAIL" && (
                              <div className="mb-3">
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                  Email Subject
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. Quick question, {{firstName}}"
                                  value={step.subject || ""}
                                  onChange={(e) => {
                                    updateStepDebounced(step.id, {
                                      subject: e.target.value,
                                    });
                                  }}
                                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
                                />
                              </div>
                            )}

                            {/* Message body */}
                            <textarea
                              value={step.content || ""}
                              onChange={(e) => {
                                updateStepDebounced(step.id, {
                                  content: e.target.value,
                                });
                              }}
                              placeholder="Write your message…"
                              className="w-full border border-gray-200 rounded-xl p-3 min-h-[110px] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white"
                            />

                            {/* Preview */}
                            {step.content && step.content.trim().length > 0 && (
                              <div className="mt-4 border-t border-gray-100 pt-4">
                                {campaignContacts.length > 0 && (
                                  <div className="mb-3">
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                                      Preview As
                                    </label>
                                    <select
                                      value={previewIndex}
                                      onChange={(e) =>
                                        setPreviewIndex(Number(e.target.value))
                                      }
                                      className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-300"
                                    >
                                      {campaignContacts.map((c, idx) => (
                                        <option key={c.id} value={idx}>
                                          {c.contact?.firstName}{" "}
                                          {c.contact?.lastName}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                )}

                                {/* ✅ FIX: show subject preview for EMAIL */}
                                {step.type === "EMAIL" && step.subject && (
                                  <div className="mb-2">
                                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                                      Subject
                                    </span>
                                    <div className="mt-1 text-sm text-gray-700 bg-amber-50 rounded-lg px-3 py-2 border border-amber-100">
                                      {replaceVariables(
                                        step.subject,
                                        previewContact,
                                      )}
                                    </div>
                                  </div>
                                )}

                                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                                  Preview
                                </span>
                                <div className="mt-1 text-sm text-gray-800 bg-gray-50 rounded-xl p-3 border border-gray-100 whitespace-pre-wrap leading-relaxed">
                                  {replaceVariables(
                                    step.content,
                                    previewContact,
                                  )}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* ADD STEP */}
      <div className="mt-6">
        <button
          onClick={() => setShowPicker(true)}
          className="flex items-center gap-2 px-5 py-2.5 border-2 border-dashed border-[#d7d7e4] rounded-2xl hover:border-violet-400 hover:bg-violet-50 hover:text-violet-700 text-gray-500 text-sm font-medium transition-all"
        >
          <span className="text-lg leading-none">+</span>
          Add Step
        </button>
        <StepTypePicker
          isOpen={showPicker}
          onClose={() => setShowPicker(false)}
          onSelect={(type) => {
            addStep(type);
            setShowPicker(false);
          }}
        />
      </div>

      {/* ACTIVITY TIMELINE */}
      <div className="mt-12">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Activity</h3>
        <div className="space-y-2">
          {activity.length === 0 ? (
            <div className="text-sm text-gray-400 py-8 text-center border border-dashed border-gray-200 rounded-2xl">
              No activity yet. Launch the campaign to get started.
            </div>
          ) : (
            activity.map((item) => (
              <div
                key={item.id}
                className="border border-[#ececf4] rounded-2xl p-4 bg-white flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">
                    {STEP_ICONS[item.step?.type] || "⚡"}
                  </span>
                  <div>
                    <div className="text-sm font-medium text-gray-800">
                      {item.step?.type?.replace(/_/g, " ")}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {item.campaignContact?.contact?.firstName}{" "}
                      {item.campaignContact?.contact?.lastName}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium
                    ${item.status === "COMPLETED" ? "bg-green-100 text-green-700" : ""}
                    ${item.status === "FAILED" ? "bg-red-100 text-red-700" : ""}
                    ${item.status === "PENDING" ? "bg-yellow-100 text-yellow-700" : ""}
                  `}
                  >
                    {item.status}
                  </span>
                  <div className="text-xs text-gray-400">
                    {item.executedAt
                      ? new Date(item.executedAt).toLocaleString()
                      : "Pending"}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* SETTINGS MODAL */}
      <CampaignSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        campaign={campaign}
        onSaved={() => {
          if (onUpdate) onUpdate(campaign);
        }}
      />

      {/* IMPORT MODAL */}
      {showImportModal && (
        <ImportContactsModal
          campaignId={campaign.id}
          onClose={() => setShowImportModal(false)}
          onImported={async (count) => {
            await loadContacts();
          }}
        />
      )}
    </div>
  );
}
