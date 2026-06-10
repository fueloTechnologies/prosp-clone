"use client";

import { useEffect, useState } from "react";
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
        const fixedSteps = sorted.map((step: any) => {
          if (
            step.type !== "WAIT" &&
            (!step.content || step.content.trim() === "")
          ) {
            return {
              ...step,
              content:
                "hi {{firstName}} {{lastName}} from {{company}} — {{position}}",
            };
          }
          return step;
        });
        setSteps(fixedSteps);
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
        steps: items.map((step, index) => ({ id: step.id, order: index })),
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
     UPDATE STEP  ✅ FIXED PATH
  ========================== */
  const updateStep = async (stepId: string, data: Partial<Step>) => {
    try {
      await fetch(`/api/campaigns/${campaign.id}/steps/${stepId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error("Update step error:", error);
    }
  };

  /* =========================
     DELETE STEP  ✅ FIXED PATH
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
    try {
      await fetch(`/api/campaigns/${campaign.id}/launch`, { method: "POST" });
      const runnerData = await fetch("/api/runner").then((r) => r.json());
      console.log("Runner response:", runnerData);
      alert("Campaign Launched 🚀");
    } catch (error) {
      console.error("Launch error:", error);
    }
  };

  if (loading && steps.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        Loading steps...
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#fafafe] p-8">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            {campaign?.name}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {campaignContacts.length} contacts
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="h-11 px-5 rounded-2xl border border-[#ececf4] bg-white hover:bg-[#fafafe] transition-all font-medium"
          >
            Add Contacts
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="h-11 px-5 rounded-2xl border border-[#ececf4] bg-white hover:bg-[#fafafe] transition-all font-medium"
          >
            ⚙ Settings
          </button>
          <button
            onClick={launchCampaign}
            className="h-11 px-5 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold shadow-lg shadow-violet-500/20 hover:scale-[1.02] transition-all duration-200"
          >
            🚀 Launch Campaign
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
                    className={`text-xs px-2 py-0.5 rounded-full
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
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-500 p-1 rounded"
                    title="Remove contact"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DRAG AREA */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="steps">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-6"
            >
              {steps.map((step, index) => (
                <Draggable key={step.id} draggableId={step.id} index={index}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.draggableProps}>
                      <div
                        {...provided.dragHandleProps}
                        className="cursor-move text-xs text-gray-400 mb-1"
                      >
                        ☰ Drag
                      </div>
                      <div className="border rounded-lg p-4 bg-white">
                        <div className="flex justify-between mb-2">
                          <span className="text-xs font-semibold text-gray-500">
                            Step {index + 1} — {step.type}
                          </span>
                          <button
                            onClick={() => deleteStep(step.id)}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Delete
                          </button>
                        </div>

                        {step.type === "WAIT" ? (
                          <div className="flex items-center gap-3">
                            <span className="text-sm">Wait</span>
                            <input
                              type="number"
                              min={0}
                              value={step.delay ?? 0}
                              onChange={(e) => {
                                const value = Number(e.target.value);
                                setSteps((prev) =>
                                  prev.map((s) =>
                                    s.id === step.id
                                      ? { ...s, delay: value }
                                      : s,
                                  ),
                                );
                                updateStep(step.id, { delay: value });
                              }}
                              className="w-20 border rounded px-2 py-1"
                            />
                            <span className="text-sm">hours</span>
                          </div>
                        ) : (
                          <>
                            <div className="flex flex-wrap gap-2 mb-2">
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
                                    setSteps((prev) =>
                                      prev.map((s) =>
                                        s.id === step.id
                                          ? { ...s, content: newContent }
                                          : s,
                                      ),
                                    );
                                    updateStep(step.id, {
                                      content: newContent,
                                    });
                                  }}
                                  className="text-xs px-2 py-1 border rounded bg-gray-50 hover:bg-gray-100"
                                >
                                  {variable}
                                </button>
                              ))}
                            </div>

                            {step.type === "EMAIL" && (
                              <input
                                type="text"
                                placeholder="Email Subject"
                                value={step.subject || ""}
                                onChange={(e) => {
                                  const subject = e.target.value;
                                  setSteps((prev) =>
                                    prev.map((s) =>
                                      s.id === step.id ? { ...s, subject } : s,
                                    ),
                                  );
                                  updateStep(step.id, { subject });
                                }}
                                className="w-full border rounded-lg px-3 py-2 mb-2 text-sm"
                              />
                            )}

                            <textarea
                              value={step.content || ""}
                              onChange={(e) => {
                                const content = e.target.value;
                                setSteps((prev) =>
                                  prev.map((s) =>
                                    s.id === step.id ? { ...s, content } : s,
                                  ),
                                );
                                updateStep(step.id, { content });
                              }}
                              className="w-full border rounded-lg p-3 min-h-[120px]"
                            />

                            {step.content && step.content.trim().length > 0 && (
                              <div className="text-xs text-gray-500 mt-3 border-t pt-3">
                                {campaignContacts.length > 0 && (
                                  <div className="mb-3">
                                    <label className="block text-xs text-gray-500 mb-1">
                                      Preview As
                                    </label>
                                    <select
                                      value={previewIndex}
                                      onChange={(e) =>
                                        setPreviewIndex(Number(e.target.value))
                                      }
                                      className="border rounded-lg px-3 py-2 text-sm bg-white"
                                    >
                                      {campaignContacts.map((c, index) => (
                                        <option key={c.id} value={index}>
                                          {c.contact?.firstName}{" "}
                                          {c.contact?.lastName}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                )}
                                <div className="font-medium mb-1">Preview</div>
                                <div className="text-sm text-gray-800 bg-gray-50 rounded-lg p-3">
                                  {replaceVariables(
                                    step.content,
                                    campaignContacts.length > 0
                                      ? campaignContacts[previewIndex]?.contact
                                      : {
                                          firstName: "John",
                                          lastName: "Doe",
                                          company: "Acme",
                                          position: "CEO",
                                        },
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
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          + Add Step
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
      <div className="mt-10">
        <h3 className="text-lg font-semibold mb-4">Activity</h3>
        <div className="space-y-3">
          {activity.length === 0 && (
            <div className="text-sm text-gray-500">No activity yet</div>
          )}
          {activity.map((item) => (
            <div key={item.id} className="border rounded-lg p-3 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">
                    <div className="flex items-center gap-2">
                      <span>
                        {item.step?.type === "CONNECTION_REQUEST" && "🔗"}
                        {item.step?.type === "MESSAGE" && "📩"}
                        {item.step?.type === "FOLLOW_UP" && "💬"}
                        {item.step?.type === "EMAIL" && "📧"}
                        {item.step?.type === "WAIT" && "⏳"}
                      </span>
                      <span>{item.step?.type?.replaceAll("_", " ")}</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {item.campaignContact?.contact?.firstName}{" "}
                    {item.campaignContact?.contact?.lastName}
                  </div>
                </div>
                <div className="mt-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full
                    ${item.status === "COMPLETED" ? "bg-green-100 text-green-700" : ""}
                    ${item.status === "FAILED" ? "bg-red-100 text-red-700" : ""}
                    ${item.status === "PENDING" ? "bg-yellow-100 text-yellow-700" : ""}
                  `}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="text-xs text-gray-400">
                  {item.executedAt
                    ? new Date(item.executedAt).toLocaleString()
                    : "Pending"}
                </div>
              </div>
            </div>
          ))}
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
            console.log(`✅ Live count update: ${count} contacts`);
            await loadContacts();
          }}
        />
      )}
    </div>
  );
}
