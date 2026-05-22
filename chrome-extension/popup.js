const APP_URL = "https://prosp-clone-xbwu.vercel.app";

document.addEventListener("DOMContentLoaded", () => {
  const statusDot = document.getElementById("statusDot");
  const statusText = document.getElementById("statusText");

  // Check if we're on LinkedIn
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    const isLinkedIn = tab?.url?.includes("linkedin.com");

    if (isLinkedIn) {
      statusDot.classList.remove("inactive");
      statusText.textContent = "Active on LinkedIn";
    } else {
      statusDot.classList.add("inactive");
      statusText.textContent = "Open LinkedIn to use";
    }
  });

  // Single Connect
  document.getElementById("connectBtn").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) return;
      chrome.tabs.sendMessage(tabs[0].id, { action: "connect" }, (response) => {
        if (chrome.runtime.lastError) {
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: () => {
              if (typeof clickConnectButton === "function")
                clickConnectButton();
            },
          });
        }
      });
    });
    window.close();
  });

  // Bulk Connect
  document.getElementById("bulkConnectBtn").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) return;
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "start_bulk_connect" },
        (response) => {
          if (chrome.runtime.lastError) {
            chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              func: () => {
                if (typeof startBulkConnect === "function") {
                  isBulkMode = true;
                  startBulkConnect();
                }
              },
            });
          }
        },
      );
    });
    window.close();
  });

  // Open Dashboard
  document.getElementById("openDashboard").addEventListener("click", () => {
    chrome.tabs.create({ url: `${APP_URL}/dashboard` });
  });

  // Open Settings
  document.getElementById("openSettings").addEventListener("click", (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: `${APP_URL}/settings` });
  });

  // Help
  document.getElementById("openHelp").addEventListener("click", (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: `${APP_URL}/training` });
  });
});
