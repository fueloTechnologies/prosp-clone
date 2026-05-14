console.log("Popup loaded");

document.addEventListener("DOMContentLoaded", () => {
  // Single Connect
  const connectBtn = document.getElementById("connectBtn");
  connectBtn.addEventListener("click", () => {
    console.log("Single Connect triggered");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) return;
      chrome.tabs.sendMessage(tabs[0].id, { action: "connect" }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("❌ Error:", chrome.runtime.lastError.message);
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: () => {
              if (typeof clickConnectButton === "function")
                clickConnectButton();
            },
          });
        } else {
          console.log("✅ Response:", response);
        }
      });
    });
  });

  // Bulk Connect
  const bulkBtn = document.getElementById("bulkConnectBtn");
  bulkBtn.addEventListener("click", () => {
    console.log("Bulk Connect triggered");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) return;
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "start_bulk_connect" },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error(
              "❌ sendMessage failed:",
              chrome.runtime.lastError.message,
            );
            // Fallback — execute directly in page
            chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              func: () => {
                if (typeof startBulkConnect === "function") {
                  isBulkMode = true;
                  startBulkConnect();
                } else {
                  console.log("❌ startBulkConnect not found in page");
                }
              },
            });
          } else {
            console.log("✅ Bulk connect message sent:", response);
          }
        },
      );
    });
  });
});
