console.log("✅ Prosp bridge ready");

// ── Ask background.js to sync user email ──
chrome.runtime.sendMessage({ action: "sync_user_email" }, (response) => {
  if (chrome.runtime.lastError) {
    console.warn(
      "⚠️ sync_user_email message error:",
      chrome.runtime.lastError.message,
    );
    return;
  }
  if (response?.email) {
    console.log("✅ User email synced via background:", response.email);
  } else {
    console.warn("⚠️ No email from background sync");
  }
});

// ── PING/PONG: let the website detect the extension is installed ──
window.addEventListener("message", (event) => {
  if (event.source !== window) return;

  // Detection ping from AccountsTab
  if (event.data?.type === "PROSP_EXTENSION_PING") {
    console.log("🏓 PING received — sending PONG");
    window.postMessage({ type: "PROSP_EXTENSION_PONG" }, "*");
    return;
  }

  // ── Website → Extension import ──
  if (event.data?.type !== "PROSP_START_IMPORT") return;

  console.log("🚀 START IMPORT RECEIVED");
  try {
    chrome.runtime.sendMessage(
      {
        action: "start_linkedin_import",
        url: event.data.payload.url,
        campaignId: event.data.payload.campaignId,
        importType: event.data.payload.importType,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error(
            "❌ sendMessage failed:",
            chrome.runtime.lastError.message,
          );
        } else {
          console.log("✅ Message sent to background:", response);
        }
      },
    );
  } catch (err) {
    console.error("❌ Bridge crashed:", err);
  }
});

// ── Save contact — inject real user email from storage ──
window.addEventListener("prosp_save_contact", (event) => {
  const payload = event.detail;
  if (!payload) return;

  chrome.storage.local.get(["prosp_user_email"], (result) => {
    payload.userEmail = result.prosp_user_email || null;

    if (!payload.userEmail) {
      console.warn(
        "⚠️ No user email in storage — contact may not save correctly",
      );
    }

    const storageKey = `pending_contact_${Date.now()}`;
    chrome.storage.local.set({ [storageKey]: payload }, () => {
      if (chrome.runtime.lastError) {
        console.error(
          "❌ Bridge storage write failed:",
          chrome.runtime.lastError.message,
        );
      } else {
        console.log(
          "✅ Bridge saved to chrome.storage:",
          storageKey,
          "for",
          payload.userEmail,
        );
      }
    });
  });
});

// ── Handle click coords ──
window.addEventListener("prosp_click_coords", (event) => {
  const { x, y } = event.detail;
  chrome.runtime.sendMessage(
    { action: "click_at_coords", x, y },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error(
          "❌ Click bridge error:",
          chrome.runtime.lastError.message,
        );
      } else {
        console.log("✅ Click sent via bridge:", response);
      }
    },
  );
});

// ── Forward connect/scrape actions from background to content.js ──
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (
    message.action === "connect" ||
    message.action === "start_bulk_connect" ||
    message.action === "scrape_search_results"
  ) {
    window.dispatchEvent(new CustomEvent("prosp_action", { detail: message }));
    sendResponse({ success: true });
  }
  return true;
});
