console.log("✅ Prosp background service worker started");
console.log("🔥 BACKGROUND LOADED");

const APP_URL = "http://localhost:3000";
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
      "| campaign:",
      payload.campaignId,
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
  console.log(
    "📤 Sending to API — campaignId:",
    payload.campaignId,
    "userEmail:",
    payload.userEmail,
  );
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
      campaignId: payload.campaignId || null, // ✅ ADDED
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

// ── RELIABLE tab messaging helper ──
// Retries sendMessage until content script is ready (max 15s)
function sendMessageWhenReady(tabId, message, maxTries = 30, interval = 500) {
  let tries = 0;
  const tryMsg = () => {
    tries++;
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        if (tries < maxTries) {
          setTimeout(tryMsg, interval);
        } else {
          console.error(
            "❌ Content script never became ready in tab",
            tabId,
            chrome.runtime.lastError.message,
          );
        }
      } else {
        console.log("✅ Message delivered to content script:", response);
      }
    });
  };
  tryMsg();
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // ── Sync user email ──
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

  // ── LinkedIn Import (triggered from website via bridge.js) ──
  if (message.action === "start_linkedin_import") {
    console.log(
      "🚀 START LINKEDIN IMPORT — url:",
      message.url,
      "campaign:",
      message.campaignId,
    );

    chrome.tabs.create({ url: message.url, active: true }, (tab) => {
      const tabId = tab.id;
      console.log("🆕 LinkedIn tab created:", tabId);

      // Listen for the tab to fully load
      chrome.tabs.onUpdated.addListener(function listener(updatedTabId, info) {
        if (updatedTabId !== tabId || info.status !== "complete") return;
        chrome.tabs.onUpdated.removeListener(listener);
        console.log("✅ LinkedIn tab fully loaded — injecting scrape command");

        // ✅ Use retry-based sending instead of a fixed timeout
        sendMessageWhenReady(tabId, {
          action: "scrape_search_results",
          campaignId: message.campaignId,
          importType: message.importType || "linkedin_search",
          url: message.url,
        });
      });
    });

    sendResponse({ success: true });
    return true;
  }

  // ── Click at coords ──
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

  // ── Execute connection request ──
  if (message.action === "execute_connection_request") {
    chrome.tabs.create({ url: message.linkedinUrl, active: true }, (tab) => {
      sendMessageWhenReady(
        tab.id,
        { action: "connect", message: message.message },
        20,
        800,
      );
    });
    sendResponse({ success: true });
    return true;
  }

  // ── Ping ──
  if (message.action === "ping") {
    sendResponse({ pong: true, version: "1.0" });
    return true;
  }
});

// ── Poll for tasks from server ──
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
          sendMessageWhenReady(
            tab.id,
            { action: "connect", message: data.task.message },
            20,
            800,
          );
          // Mark done after delivery
          setTimeout(() => {
            fetch(`${APP_URL}/api/extension/connect`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                "x-api-key": API_KEY,
              },
              body: JSON.stringify({ taskId: data.task.id, success: true }),
            });
          }, 10000);
        },
      );
    }

    if (data.task.action === "scrape_url") {
      console.log("🔍 Opening URL to scrape:", data.task.url);
      chrome.tabs.create({ url: data.task.url, active: true }, (tab) => {
        sendMessageWhenReady(
          tab.id,
          {
            action: "scrape_search_results",
            campaignId: data.task.campaignId,
          },
          30,
          500,
        );
        setTimeout(() => {
          fetch(`${APP_URL}/api/extension/connect`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": API_KEY,
            },
            body: JSON.stringify({ taskId: data.task.id, success: true }),
          });
        }, 15000);
      });
    }

    if (data.task.action === "lead_finder") {
      const { title, company, location, industry } = data.task.filters || {};
      const keywords = [title, company, location, industry]
        .filter(Boolean)
        .join(" ");
      const searchUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(keywords)}`;
      console.log("🔍 Lead finder search:", searchUrl);
      chrome.tabs.create({ url: searchUrl, active: true }, (tab) => {
        sendMessageWhenReady(
          tab.id,
          {
            action: "scrape_search_results",
            campaignId: data.task.campaignId,
          },
          30,
          500,
        );
        setTimeout(() => {
          fetch(`${APP_URL}/api/extension/connect`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": API_KEY,
            },
            body: JSON.stringify({ taskId: data.task.id, success: true }),
          });
        }, 15000);
      });
    }
  } catch (error) {
    console.error("❌ Polling failed:", error.message);
  }
}

setInterval(pollTasks, 5000);
