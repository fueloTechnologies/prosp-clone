// bridge.js — ISOLATED world, bridges content.js → chrome APIs

console.log("✅ Prosp bridge ready");

// Save contact to chrome.storage
window.addEventListener("prosp_save_contact", (event) => {
  const payload = event.detail;
  if (!payload) return;

  const storageKey = `pending_contact_${Date.now()}`;
  chrome.storage.local.set({ [storageKey]: payload }, () => {
    if (chrome.runtime.lastError) {
      console.error(
        "❌ Bridge storage write failed:",
        chrome.runtime.lastError.message,
      );
    } else {
      console.log("✅ Bridge saved to chrome.storage:", storageKey);
    }
  });
});

// Handle debugger click from content.js
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

// Forward connect action from background to content
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "connect" || message.action === "start_bulk_connect") {
    window.dispatchEvent(new CustomEvent("prosp_action", { detail: message }));
    sendResponse({ success: true });
  }
  return true;
});
