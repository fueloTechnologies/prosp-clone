"use client";

import { useEffect, useState } from "react";
import StepTypePicker from "./StepTypePicker";
import { replaceVariables } from "@/lib/variables";
import CampaignSettingsModal from "./CampaignSettingsModal";

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
}: {
  campaign: any;
  onUpdate: (updated: any) => void;
}) {
  const [steps, setSteps] = useState<Step[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [campaignContacts, setCampaignContacts] = useState<any[]>([]);
  const [allContacts, setAllContacts] = useState<any[]>([]);
  const [previewContact, setPreviewContact] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingContacts, setAddingContacts] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [search, setSearch] = useState("");
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
      console.log("Loading steps for:", campaign.id);

      setLoading(true);

      const res = await fetch(`/api/campaigns/${campaign.id}/steps`);

      const data = await res.json();

      console.log("Steps loaded:", data);

      if (Array.isArray(data)) {
        const sorted = data.sort(
          (a: any, b: any) => (a.order || 0) - (b.order || 0),
        );

        /* 🔥 FIX — Auto-fill empty step content */

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
      console.log("Loading contacts for campaign:", campaign.id);

      const res = await fetch(`/api/campaigns/${campaign.id}/contacts`);

      const data = await res.json();

      console.log("Loaded contacts:", data);

      if (Array.isArray(data)) {
        setCampaignContacts(data);

        if (data.length > 0) {
          setPreviewContact(data[0]);

          console.log("Preview contact set:", data[0]);
        }
      }
    } catch (err) {
      console.error("Contacts load error:", err);
    }
  };

  const loadAllContacts = async () => {
    try {
      const res = await fetch("/api/contacts");

      const data = await res.json();

      console.log("All contacts:", data);

      if (Array.isArray(data)) {
        setAllContacts(data);
      }
    } catch (err) {
      console.error("All contacts load error:", err);
    }
  };
  const filteredContacts = allContacts.filter((c: any) => {
    const full =
      `${c.firstName} ${c.lastName} ${c.company} ${c.position}`.toLowerCase();

    return full.includes(search.toLowerCase());
  });
  const loadActivity = async () => {
    if (!campaign?.id) return;

    try {
      const res = await fetch(`/api/campaigns/${campaign.id}/activity`);

      const data = await res.json();

      console.log("Activity loaded:", data);

      if (Array.isArray(data)) {
        setActivity(data);
      }
    } catch (err) {
      console.error("Activity load error:", err);
    }
  };
  /* =========================
   INITIAL LOAD
========================= */

  useEffect(() => {
    if (!campaign?.id) return;

    console.log("Campaign changed:", campaign.id);

    loadSteps();
    loadContacts();
    loadAllContacts();
    loadActivity();
  }, [campaign?.id]);

  /* =========================
   ADD SELECTED CONTACTS
========================= */

  const addSelectedContacts = async () => {
    console.log("Campaign:", campaign);
    console.log("Selected:", selectedContacts);

    if (!campaign?.id) return;

    try {
      if (selectedContacts.length === 0) {
        alert("Select at least one contact");

        return;
      }

      console.log("Selected contacts:", selectedContacts);

      const res = await fetch(`/api/campaigns/${campaign.id}/contacts`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          contactIds: selectedContacts,
        }),
      });

      const data = await res.json();

      console.log("Contacts added response:", data);

      if (data.count > 0) {
        await loadContacts();

        setSelectedContacts([]);

        setAddingContacts(false);
      } else {
        alert("No contacts added");
      }
    } catch (err) {
      console.error("Add contacts error:", err);
    }
  };

  /* =========================
     DRAG HANDLER
  ========================== */

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(steps);

    const [moved] = items.splice(result.source.index, 1);

    items.splice(result.destination.index, 0, moved);

    setSteps(items);

    const reordered = items.map((step, index) => ({
      id: step.id,
      order: index,
    }));

    await fetch("/api/steps/reorder", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        steps: reordered,
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
        headers: {
          "Content-Type": "application/json",
        },
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
     DELETE STEP
  ========================== */

  const deleteStep = async (id: string) => {
    try {
      await fetch(`/api/steps/${id}`, {
        method: "DELETE",
      });

      await loadSteps();
    } catch (error) {
      console.error("Delete step error:", error);
    }
  };

  /* =========================
   LAUNCH CAMPAIGN
========================= */
  const launchCampaign = async () => {
    if (!campaign?.id) return;

    try {
      console.log("Launching campaign:", campaign.id);

      await fetch(`/api/campaigns/${campaign.id}/launch`, {
        method: "POST",
      });

      // 🔥 RUNNER
      const runnerRes = await fetch("/api/runner");

      const runnerData = await runnerRes.json();

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
    <div className="flex-1 overflow-y-auto p-6">
      {/* HEADER */}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold">{campaign?.name}</h2>

          <p className="text-sm text-gray-500">
            {campaignContacts.length} contacts
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setAddingContacts(true)}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Add Contacts
          </button>

          {/* NEW SETTINGS BUTTON */}

          <button
            onClick={() => setShowSettings(true)}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            ⚙ Settings
          </button>

          <button
            onClick={launchCampaign}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            🚀 Launch Campaign
          </button>
        </div>
      </div>

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

                                fetch(`/api/steps/${step.id}`, {
                                  method: "PUT",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    delay: value,
                                  }),
                                });
                              }}
                              className="w-20 border rounded px-2 py-1"
                            />

                            <span className="text-sm">hours</span>
                          </div>
                        ) : (
                          <>
                            {/* VARIABLE BUTTONS */}

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
                                    const token = ` {{${variable}}}`;

                                    const newContent =
                                      (step.content || "") + token;

                                    /* Update UI */

                                    setSteps((prev) =>
                                      prev.map((s) =>
                                        s.id === step.id
                                          ? {
                                              ...s,
                                              content: newContent,
                                            }
                                          : s,
                                      ),
                                    );

                                    /* Save to DB */

                                    fetch(`/api/steps/${step.id}`, {
                                      method: "PUT",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                      body: JSON.stringify({
                                        content: newContent,
                                      }),
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

                                  fetch(`/api/steps/${step.id}`, {
                                    method: "PUT",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                      subject,
                                    }),
                                  });
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

                                fetch(`/api/steps/${step.id}`, {
                                  method: "PUT",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    content,
                                  }),
                                });
                              }}
                              className="w-full border rounded-lg p-3 min-h-[120px]"
                            />

                            {/* SHOW PREVIEW ONLY IF CONTENT EXISTS */}

                            {step.content && step.content.trim().length > 0 && (
                              <div className="text-xs text-gray-500 mt-2 border-t pt-2">
                                Preview:
                                <div className="mt-1 text-gray-700">
                                  {replaceVariables(
                                    step.content,

                                    campaignContacts.length > 0
                                      ? campaignContacts[0]
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
          onSelect={(type) => addStep(type)}
        />
      </div>

      {/* CONTACT MODAL */}

      {addingContacts && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[400px]">
            <h2 className="text-lg font-semibold mb-4">Select Contacts</h2>
            <input
              type="text"
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-3 text-sm"
            />{" "}
            <div className="max-h-[250px] overflow-y-auto border rounded-lg p-2 space-y-2">
              {allContacts.length === 0 && (
                <div className="text-sm text-gray-500 text-center py-4">
                  No contacts found
                </div>
              )}

              {filteredContacts.map((c: any) => (
                <label
                  key={c.id}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedContacts.includes(c.id)}
                    onChange={() => {
                      setSelectedContacts((prev) => {
                        if (prev.includes(c.id)) {
                          return prev.filter((id) => id !== c.id);
                        }

                        return [...prev, c.id];
                      });
                    }}
                    className="w-4 h-4"
                  />

                  <div>
                    <div className="font-medium">
                      {c.firstName} {c.lastName}
                    </div>

                    <div className="text-xs text-gray-500">
                      {c.company} — {c.position}
                    </div>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={addSelectedContacts}
                className="px-4 py-2 bg-black text-white rounded-lg"
              >
                Add Selected
              </button>

              <button
                onClick={() => setAddingContacts(false)}
                className="text-sm text-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
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
                    <div className="font-medium text-sm">
                      <div className="flex items-center gap-2">
                        <span>
                          {item.step?.type === "CONNECTION_REQUEST" && "🔗"}
                          {item.step?.type === "MESSAGE" && "📩"}
                          {item.step?.type === "FOLLOW_UP" && "💬"}
                          {item.step?.type === "WAIT" && "⏳"}
                        </span>

                        <span>{item.step?.type?.replaceAll("_", " ")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mt-1">
                    {item.campaignContact?.contact?.firstName}{" "}
                    {item.campaignContact?.contact?.lastName}
                  </div>
                </div>
                {/* STATUS BADGE HERE */}

                <div className="mt-2">
                  <span
                    className={`
      text-xs px-2 py-1 rounded-full

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
      <CampaignSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        campaign={campaign}
        onSaved={() => {
          console.log("Settings saved");

          // reload campaign if needed
          if (onUpdate) {
            onUpdate(campaign);
          }
        }}
      />
    </div>
  );
}
