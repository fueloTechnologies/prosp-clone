console.log("✅ Prosp background service worker started");

// Keep service worker alive
const keepAlive = () =>
  setInterval(() => chrome.runtime.getPlatformInfo(() => {}), 20000);
chrome.runtime.onStartup.addListener(keepAlive);
keepAlive();

const API_KEY = "prosp-extension-secret-123";

// ============================
// WATCH chrome.storage FOR NEW CONTACTS
// ============================
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;

  for (const key of Object.keys(changes)) {
    if (!key.startsWith("pending_contact_")) continue;

    const payload = changes[key].newValue;
    if (!payload) continue;

    console.log("📦 New contact detected in storage:", payload.fullName);

    if (
      !payload.firstName ||
      payload.firstName === "Unknown" ||
      !payload.linkedinUrl ||
      payload.linkedinUrl === "https://www.linkedin.com/"
    ) {
      console.log("⚠️ Invalid contact — skipping:", payload.firstName);
      chrome.storage.local.remove(key);
      continue;
    }

    saveContactToAPI(key, payload);
  }
});

function saveContactToAPI(key, payload, retries = 3) {
  fetch("http://localhost:3000/api/contacts/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    body: JSON.stringify({
      firstName: payload.firstName,
      lastName: payload.lastName || "",
      email: null,
      company: payload.company || "",
      position: payload.position || "",
      linkedinUrl: payload.linkedinUrl || "",
      location: payload.location || "",
      avatar: payload.avatar || "",
    }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("API error: " + res.status);
      return res.json();
    })
    .then((data) => {
      console.log("✅ Contact saved to DB:", data);
      chrome.storage.local.remove(key);
    })
    .catch((err) => {
      console.error("❌ Save failed:", err.message);
      if (retries > 0) {
        console.log(`🔄 Retrying... (${retries} left)`);
        setTimeout(() => saveContactToAPI(key, payload, retries - 1), 2000);
      } else {
        console.error("❌ All retries failed for:", payload.fullName);
      }
    });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 🔧 DEBUG CLICK HANDLER
  if (message.action === "click_at_coords") {
    const tabId = sender.tab.id;

    chrome.debugger.attach({ tabId }, "1.3", () => {
      if (chrome.runtime.lastError) {
        console.log("Debugger error:", chrome.runtime.lastError.message);
      }

      setTimeout(() => {
        chrome.debugger.sendCommand(
          { tabId },
          "Input.dispatchMouseEvent",
          {
            type: "mousePressed",
            x: message.x,
            y: message.y,
            button: "left",
            clickCount: 1,
          },
          () => {
            chrome.debugger.sendCommand(
              { tabId },
              "Input.dispatchMouseEvent",
              {
                type: "mouseReleased",
                x: message.x,
                y: message.y,
                button: "left",
                clickCount: 1,
              },
              () => {
                chrome.debugger.detach({ tabId });
                sendResponse({ success: true });
              },
            );
          },
        );
      }, 500);
    });

    return true;
  }

  // 🚀 EXECUTE CONNECTION REQUEST
  if (message.action === "execute_connection_request") {
    console.log("🚀 Executing LinkedIn connect:", message.linkedinUrl);

    chrome.tabs.create({ url: message.linkedinUrl, active: true }, (tab) => {
      console.log("✅ LinkedIn tab opened");

      setTimeout(() => {
        chrome.tabs.sendMessage(
          tab.id,
          {
            action: "connect",
            message: message.message,
          },
          (response) => {
            console.log("✅ Connect trigger sent:", response);
          },
        );
      }, 8000);
    });

    sendResponse({ success: true });
    return true;
  }
});

/* ============================
   POLL BACKEND FOR TASKS
============================= */
async function pollTasks() {
  try {
    const response = await fetch(
      "http://localhost:3000/api/extension/connect",
      {
        headers: { "x-api-key": API_KEY },
      },
    );

    if (!response.ok) {
      console.warn("⚠️ Poll response not OK:", response.status);
      return;
    }

    const data = await response.json();

    if (!data.task) return;

    console.log("📥 Task received:", data.task);

    if (data.task.action === "execute_connection_request") {
      chrome.tabs.create(
        { url: data.task.linkedinUrl, active: true },
        (tab) => {
          console.log("✅ LinkedIn tab opened for campaign task");

          setTimeout(() => {
            chrome.tabs.sendMessage(
              tab.id,
              {
                action: "connect",
                message: data.task.message,
              },
              (response) => {
                console.log("✅ Connect trigger sent:", response);

                fetch("http://localhost:3000/api/extension/connect", {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                    "x-api-key": API_KEY,
                  },
                  body: JSON.stringify({
                    taskId: data.task.id,
                    success: true,
                  }),
                })
                  .then(() => {
                    console.log("✅ Task completion reported:", data.task.id);
                  })
                  .catch((err) => {
                    console.error("❌ Report failed:", err);
                  });
              },
            );
          }, 8000);
        },
      );
    }
  } catch (error) {
    console.error("❌ Polling failed:", error.message);
  }
}

setInterval(pollTasks, 5000);
