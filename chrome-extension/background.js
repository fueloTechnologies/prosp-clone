console.log("✅ Prosp background service worker started");

// ── Config — change this to your production URL when deployed ──
const APP_URL = "https://prosp-clone-xbwu.vercel.app";
const API_KEY = "prosp-extension-secret-123";

const keepAlive = () =>
  setInterval(() => chrome.runtime.getPlatformInfo(() => {}), 20000);
chrome.runtime.onStartup.addListener(keepAlive);
keepAlive();

// ── Watch chrome.storage for new contacts ──
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  for (const key of Object.keys(changes)) {
    if (!key.startsWith("pending_contact_")) continue;
    const payload = changes[key].newValue;
    if (!payload) continue;
    console.log(
      "📦 New contact detected:",
      payload.fullName,
      "| user:",
      payload.userEmail,
    );
    if (
      !payload.firstName ||
      payload.firstName === "Unknown" ||
      !payload.linkedinUrl ||
      payload.linkedinUrl === "https://www.linkedin.com/"
    ) {
      console.log("⚠️ Invalid contact — skipping");
      chrome.storage.local.remove(key);
      continue;
    }
    saveContactToAPI(key, payload);
  }
});

function saveContactToAPI(key, payload, retries = 3) {
  console.log("📤 Sending to API — userEmail:", payload.userEmail);
  fetch(`${APP_URL}/api/contacts/save`, {
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
      userEmail: payload.userEmail || null,
    }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("API error: " + res.status);
      return res.json();
    })
    .then((data) => {
      console.log("✅ Contact saved to DB:", data.firstName, data.lastName);
      chrome.storage.local.remove(key);
    })
    .catch((err) => {
      console.error("❌ Save failed:", err.message);
      if (retries > 0) {
        setTimeout(() => saveContactToAPI(key, payload, retries - 1), 2000);
      }
    });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "sync_user_email") {
    fetch(`${APP_URL}/api/auth/session-sync`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Status " + res.status);
        return res.json();
      })
      .then((data) => {
        if (data.email) {
          chrome.storage.local.set({ prosp_user_email: data.email }, () => {
            console.log("✅ User email stored:", data.email);
          });
          sendResponse({ email: data.email });
        } else {
          sendResponse({ email: null });
        }
      })
      .catch((err) => {
        console.warn("⚠️ session-sync failed:", err.message);
        sendResponse({ email: null });
      });
    return true;
  }

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

  if (message.action === "execute_connection_request") {
    chrome.tabs.create({ url: message.linkedinUrl, active: true }, (tab) => {
      setTimeout(() => {
        chrome.tabs.sendMessage(
          tab.id,
          { action: "connect", message: message.message },
          (response) => {
            console.log("✅ Connect trigger sent:", response);
          },
        );
      }, 8000);
    });
    sendResponse({ success: true });
    return true;
  }

  // ── Extension status ping — used by settings page to detect extension ──
  if (message.action === "ping") {
    sendResponse({ pong: true, version: "1.0" });
    return true;
  }
});

async function pollTasks() {
  try {
    const response = await fetch(`${APP_URL}/api/extension/connect`, {
      headers: { "x-api-key": API_KEY },
    });
    if (!response.ok) return;
    const data = await response.json();
    if (!data.task) return;
    console.log("📥 Task received:", data.task);
    if (data.task.action === "execute_connection_request") {
      chrome.tabs.create(
        { url: data.task.linkedinUrl, active: true },
        (tab) => {
          setTimeout(() => {
            chrome.tabs.sendMessage(
              tab.id,
              { action: "connect", message: data.task.message },
              () => {
                fetch(`${APP_URL}/api/extension/connect`, {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                    "x-api-key": API_KEY,
                  },
                  body: JSON.stringify({ taskId: data.task.id, success: true }),
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
