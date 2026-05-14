console.log("🔥 CONTENT JS LOADED");
console.log("🔥 Prosp content.js injected successfully");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay(min, max) {
  const time = Math.floor(Math.random() * (max - min + 1)) + min;
  console.log(`⏳ Waiting ${time} ms`);
  return new Promise((resolve) => setTimeout(resolve, time));
}

let connectButtons = [];
let index = 0;
let currentPage = 0;
let isBulkMode = false;

const MAX_CONNECTS = 25;
let sentCount = 0;

const DEFAULT_MESSAGE = `Hi {firstName},

Came across your profile and would love to connect!

Best,
Tejeshwar`;

function checkWeeklyLimit() {
  const bodyText = document.body.innerText.toLowerCase();
  if (bodyText.includes("weekly limit")) {
    console.log("🚫 Weekly limit reached — stopping automation");
    return true;
  }
  return false;
}

/* ============================
   HELPER: Parse position + company
   Handles: "Role at Company", "Role @ Company",
            "Role | Company", "Role • Company", plain "Role"
============================= */
function parsePositionCompany(text) {
  if (!text) return { position: "", company: "" };
  text = text.replace(/\n/g, " ").replace(/\s+/g, " ").trim();

  if (text.includes(" at ")) {
    const parts = text.split(" at ");
    return {
      position: parts[0].trim(),
      company: parts.slice(1).join(" at ").trim(),
    };
  }
  if (text.includes(" @ ")) {
    const parts = text.split(" @ ");
    return {
      position: parts[0].trim(),
      company: parts.slice(1).join(" @ ").trim(),
    };
  }
  if (text.includes(" | ")) {
    const parts = text.split(" | ");
    return {
      position: parts[0].trim(),
      company: parts[parts.length - 1].trim(),
    };
  }
  if (text.includes(" • ")) {
    const parts = text.split(" • ");
    return {
      position: parts[0].trim(),
      company: parts.slice(1).join(" • ").trim(),
    };
  }
  return { position: text.trim(), company: "" };
}

/* ============================
   HELPER: Extract headline from a search result card
============================= */
function extractHeadlineFromCard(card) {
  if (!card) return "";

  const selectors = [
    '[data-field="headline"]',
    ".entity-result__primary-subtitle",
    ".entity-result__secondary-subtitle",
    ".artdeco-entity-lockup__subtitle",
    ".artdeco-entity-lockup__caption",
  ];

  for (const sel of selectors) {
    const el = card.querySelector(sel);
    const text = el?.innerText?.trim();
    if (text && text.length > 2 && text.length < 150) return text;
  }

  const JOB_KEYWORDS = [
    "Engineer",
    "Developer",
    "Manager",
    "Analyst",
    "Director",
    "Founder",
    "CEO",
    "CTO",
    "CFO",
    "COO",
    "Designer",
    "Lead",
    "Consultant",
    "Architect",
    "Head",
    "VP",
    "President",
    "Officer",
    "Specialist",
    "Associate",
    "Intern",
    "Student",
    "Researcher",
    "Scientist",
    "Product",
    "Marketing",
    "Sales",
    "Operations",
    "HR",
    "Professor",
  ];

  const spans = Array.from(card.querySelectorAll("span, div"))
    .map((el) => el.innerText?.replace(/\n/g, " ").replace(/\s+/g, " ").trim())
    .filter((t) => {
      if (!t || t.length < 3 || t.length > 150) return false;
      if (t.includes("Connect") || t.includes("Follow")) return false;
      const hasSeparator =
        t.includes(" at ") || t.includes(" @ ") || t.includes(" | ");
      const hasKeyword = JOB_KEYWORDS.some((kw) => t.includes(kw));
      return hasSeparator || hasKeyword;
    });

  return spans[0] || "";
}

/* ============================
   HELPER: Find the main profile Connect button
   Scoped to current profile — ignores sidebar buttons
============================= */
function findMainConnectButton() {
  const firstName = window.currentFirstName || "";
  const fullTitle = document.title.split("|")[0].trim(); // e.g. "Raja Patel"

  // 1. Try exact aria-label match with full name (most reliable)
  if (fullTitle) {
    const exact = document.querySelector(
      `button[aria-label="Invite ${fullTitle} to connect"]`,
    );
    if (exact) {
      console.log("✅ Found by full name aria-label");
      return exact;
    }
  }

  // 2. Try first name match in aria-label
  if (firstName) {
    const byFirst = Array.from(document.querySelectorAll("button")).find(
      (b) => {
        const label = b.getAttribute("aria-label") || "";
        return (
          label.includes(`Invite ${firstName}`) && label.includes("connect")
        );
      },
    );
    if (byFirst) {
      console.log("✅ Found by first name aria-label");
      return byFirst;
    }
  }

  // 3. Try generic Connect aria-label (excludes sidebar "Invite X to connect" buttons)
  const genericConnect = document.querySelector('button[aria-label="Connect"]');
  if (genericConnect) {
    console.log("✅ Found generic Connect");
    return genericConnect;
  }

  // 4. Find Connect button inside main profile section only (not sidebar)
  const mainSection = document.querySelector("main");
  if (mainSection) {
    // Look for button with text "Connect" that is NOT inside a pymk/sidebar card
    const btn = Array.from(mainSection.querySelectorAll("button")).find((b) => {
      const text = b.innerText?.trim();
      const label = b.getAttribute("aria-label") || "";
      const inSidebar =
        b.closest('[data-view-name="pymk-card"]') ||
        b.closest(".scaffold-finite-scroll__content aside") ||
        b.closest('[data-view-name="cohort-card"]');
      return (
        !inSidebar &&
        (text === "Connect" || label.toLowerCase().includes("connect"))
      );
    });
    if (btn) {
      console.log("✅ Found in main section");
      return btn;
    }
  }

  // 5. Last resort — find the FIRST Connect button whose aria-label matches current page person
  const allConnectBtns = Array.from(document.querySelectorAll("button")).filter(
    (b) => b.innerText?.trim() === "Connect",
  );
  // Filter out sidebar buttons (they have specific aria-labels with other people's names)
  const profileBtn = allConnectBtns.find((b) => {
    const label = b.getAttribute("aria-label") || "";
    // If no aria-label, it's likely the main profile button
    if (!label) return true;
    // If aria-label contains current profile name, use it
    if (firstName && label.includes(firstName)) return true;
    return false;
  });

  return profileBtn || null;
}

/* ============================
   SINGLE CONNECT (profile page)
============================= */
function clickConnectButton() {
  console.log("Searching MAIN profile Connect button...");

  // Capture name from title (most reliable on LinkedIn)
  try {
    let fullName = document.title.split("|")[0].trim();
    if (fullName && !fullName.toLowerCase().includes("linkedin")) {
      const firstName = fullName.split(" ")[0];
      window.currentFirstName =
        firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
      console.log("👤 Profile name captured:", window.currentFirstName);
    } else {
      // fallback to h1
      const h1 = document.querySelector("h1");
      if (h1) {
        const name = h1.innerText.trim().split(" ")[0];
        window.currentFirstName =
          name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
      }
    }
  } catch (err) {
    console.log("⚠️ Name capture failed", err);
  }

  const connectBtn = findMainConnectButton();

  if (connectBtn) {
    console.log("✅ MAIN Connect FOUND — clicking");
    connectBtn.click();
    // Save contact immediately when connect is clicked (don't wait for modal)
    setTimeout(() => {
      saveContactToDatabase("", window.location.href);
    }, 1000);
    setTimeout(() => {
      clickAddNote();
    }, 2000);
  } else {
    console.log("❌ MAIN Connect not found");
    // Still save the contact even if connect button not found
    saveContactToDatabase("", window.location.href);
  }
}

window.clickConnectButton = clickConnectButton;

/* ============================
   MESSAGE LISTENER
============================= */
window.addEventListener("prosp_action", (event) => {
  const message = event.detail;
  console.log("📩 Message received via window event:", message);

  if (message.action === "connect") {
    isBulkMode = false;
    // Support campaign message if passed
    if (message.message) window.campaignMessage = message.message;
    clickConnectButton();
  }
  if (message.action === "start_bulk_connect") {
    isBulkMode = true;
    startBulkConnect();
  }
});

/* ============================
   BULK CONNECT
============================= */
function startBulkConnect() {
  console.log("🚀 Starting bulk connect...");
  index = 0;

  const savedCount = sessionStorage.getItem("prosp_sent_count");
  const savedPage = sessionStorage.getItem("prosp_page");

  if (savedCount) {
    sentCount = parseInt(savedCount);
    currentPage = savedPage ? parseInt(savedPage) : 0;
    console.log(`📊 Resuming — sent: ${sentCount}, page: ${currentPage + 1}`);
    sessionStorage.removeItem("prosp_sent_count");
    sessionStorage.removeItem("prosp_page");
    sessionStorage.removeItem("prosp_keywords");
    sessionStorage.removeItem("prosp_bulk_running");
  } else {
    sentCount = 0;
    currentPage = 0;
  }

  autoScrollAndCollect();
}

function autoScrollAndCollect() {
  isBulkMode = true;
  console.log("📜 Starting auto-scroll...");
  let lastHeight = 0;
  let attempts = 0;
  const scrollInterval = setInterval(() => {
    window.scrollTo(0, document.body.scrollHeight);
    let newHeight = document.body.scrollHeight;
    if (newHeight === lastHeight) attempts++;
    else attempts = 0;
    lastHeight = newHeight;
    if (attempts > 5) {
      clearInterval(scrollInterval);
      setTimeout(() => collectConnectButtons(), 3000);
    }
  }, 2000);
}

/* ============================
   COLLECT CONNECT BUTTONS (Bulk)
============================= */
function collectConnectButtons() {
  connectButtons = Array.from(document.querySelectorAll("span")).filter(
    (el) => el.innerText?.trim() === "Connect",
  );

  console.log("✅ Total Connect buttons:", connectButtons.length);

  window.bulkContactData = connectButtons.map((el, i) => {
    let card = el.parentElement;
    for (let j = 0; j < 10; j++) {
      if (!card) break;
      if (card.querySelector('a[href*="/in/"]')) break;
      card = card.parentElement;
    }

    const linkEl = card?.querySelector('a[href*="/in/"]');
    const linkedinUrl = linkEl ? linkEl.href.split("?")[0] : "";

    let firstName = "Unknown",
      lastName = "";
    if (linkedinUrl) {
      const slug = linkedinUrl.split("/in/")[1]?.replace(/\/$/, "") || "";
      const namePart = slug.replace(/-[a-z0-9]{4,}$/i, "").trim();
      const words = namePart
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1));
      firstName = words[0] || "Unknown";
      lastName = words.slice(1).join(" ") || "";
    }

    // Also try to get name from card text
    const nameEl = card?.querySelector(
      '[data-field="full_name"], .entity-result__title-text',
    );
    if (nameEl) {
      const cardName = nameEl.innerText?.trim().split("\n")[0];
      if (cardName) {
        const parts = cardName.split(" ");
        firstName = parts[0] || firstName;
        lastName = parts.slice(1).join(" ") || lastName;
      }
    }

    const headline = extractHeadlineFromCard(card);
    const { position, company } = parsePositionCompany(headline);

    console.log(
      `👤 ${firstName} ${lastName} | pos: "${position}" | co: "${company}"`,
    );

    return {
      firstName,
      lastName,
      position,
      company,
      location: "",
      linkedinUrl,
      avatar: "",
    };
  });

  // Deduplicate
  const seen = new Set();
  const deduped = [];
  const dedupedBtns = [];
  connectButtons.forEach((btn, i) => {
    const url = window.bulkContactData[i]?.linkedinUrl;
    if (url && !seen.has(url)) {
      seen.add(url);
      deduped.push(window.bulkContactData[i]);
      dedupedBtns.push(btn);
    }
  });
  window.bulkContactData = deduped;
  connectButtons = dedupedBtns;

  console.log("✅ After dedup:", connectButtons.length);

  if (connectButtons.length === 0) {
    goToNextPage(5000);
    return;
  }

  clickNext();
}

/* ============================
   SAVE BULK CONTACT
============================= */
const savedUrls = new Set();

function saveBulkContact() {
  const contactData = window.bulkContactData?.[index - 1];
  if (!contactData) return;

  if (contactData.linkedinUrl && savedUrls.has(contactData.linkedinUrl)) {
    console.log("⏭️ Skipping duplicate:", contactData.firstName);
    return;
  }

  if (contactData.linkedinUrl) savedUrls.add(contactData.linkedinUrl);

  console.log("💾 Saving bulk contact:", contactData);

  window.dispatchEvent(
    new CustomEvent("prosp_save_contact", { detail: contactData }),
  );
}

/* ============================
   CLICK NEXT BUTTON
============================= */
async function clickNext() {
  if (index >= connectButtons.length || sentCount >= MAX_CONNECTS) {
    console.log("🎉 Bulk connect finished");
    isBulkMode = false;
    return;
  }
  if (checkWeeklyLimit()) return;

  const btn = connectButtons[index];
  if (!btn) {
    index++;
    setTimeout(() => clickNext(), 5000);
    return;
  }

  if (window.bulkContactData?.[index]) {
    window.currentFirstName = window.bulkContactData[index].firstName;
  }

  btn.scrollIntoView({ block: "center" });
  await randomDelay(1000, 1500);

  const rect = btn.getBoundingClientRect();
  const x = Math.round(rect.left + rect.width / 2);
  const y = Math.round(rect.top + rect.height / 2);

  window.dispatchEvent(
    new CustomEvent("prosp_click_coords", { detail: { x, y } }),
  );

  await randomDelay(2000, 3000);
  clickAddNote();
}

/* ============================
   CLICK ADD NOTE / SEND
============================= */
function clickAddNote() {
  console.log("📝 Looking for Add Note / Send Without Note...");
  let tries = 0;

  const interval = setInterval(() => {
    tries++;

    const allBtns = Array.from(
      document.querySelectorAll('button, [role="button"]'),
    );

    const addNoteBtn = allBtns.find((btn) => {
      const text = btn.innerText?.toLowerCase().trim();
      return text === "add a note" || text?.includes("add a note");
    });

    if (addNoteBtn) {
      console.log("✅ Add Note FOUND — clicking");
      clearInterval(interval);
      addNoteBtn.click();
      setTimeout(() => insertMessage(), 1800);
      return;
    }

    const sendWithoutBtn = allBtns.find((btn) => {
      const text = btn.innerText?.toLowerCase().trim();
      return text?.includes("send without") || text?.includes("without a note");
    });

    if (sendWithoutBtn) {
      console.log("✅ Send without note FOUND — clicking");
      clearInterval(interval);
      sendWithoutBtn.click();
      sentCount++;
      index++;
      console.log(`🎉 Sent! 📊 ${sentCount} / ${MAX_CONNECTS}`);
      afterSend();
      return;
    }

    const host = document.querySelector("#interop-outlet");
    if (host?.shadowRoot) {
      const shadowBtns = Array.from(host.shadowRoot.querySelectorAll("button"));

      const shadowAdd = shadowBtns.find((b) =>
        b.innerText?.toLowerCase().includes("add a note"),
      );
      if (shadowAdd) {
        console.log("✅ Add Note in shadow DOM");
        clearInterval(interval);
        shadowAdd.click();
        setTimeout(() => insertMessage(), 1800);
        return;
      }

      const shadowSend = shadowBtns.find(
        (b) =>
          b.innerText?.toLowerCase().includes("send without") ||
          b.innerText?.toLowerCase().trim() === "send",
      );
      if (shadowSend) {
        console.log("✅ Send in shadow DOM");
        clearInterval(interval);
        shadowSend.click();
        sentCount++;
        index++;
        console.log(`🎉 Sent! 📊 ${sentCount} / ${MAX_CONNECTS}`);
        afterSend();
        return;
      }
    }

    if (tries > 25) {
      console.log("❌ Modal not found — skipping");
      clearInterval(interval);
      index++;

      if (!isBulkMode) {
        // Single mode: save contact even if modal not found
        saveContactToDatabase("", window.location.href);
        return;
      }

      const delay = Math.floor(Math.random() * (15000 - 8000)) + 8000;
      if (index >= connectButtons.length) {
        goToNextPage(delay);
      } else {
        setTimeout(() => clickNext(), delay);
      }
    }
  }, 700);
}

/* ============================
   INSERT MESSAGE
============================= */
function insertMessage() {
  console.log("✏️ Inserting message...");
  let tries = 0;
  const interval = setInterval(() => {
    tries++;

    const regularTextarea = document.querySelector("textarea");
    if (regularTextarea) {
      clearInterval(interval);
      fillMessage(regularTextarea);
      setTimeout(() => clickSend(), 2000);
      return;
    }

    const host = document.querySelector("#interop-outlet");
    if (host?.shadowRoot) {
      const textarea = host.shadowRoot.querySelector("textarea");
      if (textarea) {
        clearInterval(interval);
        fillMessage(textarea);
        setTimeout(() => clickSend(), 2000);
        return;
      }
    }

    if (tries > 20) {
      console.log("❌ Textarea not found — trying send anyway");
      clearInterval(interval);
      clickSend();
    }
  }, 700);
}

function fillMessage(textarea) {
  let firstName = window.currentFirstName || "there";
  firstName =
    firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
  const msg = window.campaignMessage || DEFAULT_MESSAGE;
  const finalMessage = msg
    .replace("{firstName}", firstName)
    .replace("{{firstName}}", firstName);
  textarea.focus();
  textarea.value = finalMessage;
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
  textarea.dispatchEvent(new Event("change", { bubbles: true }));
  console.log("✅ Message inserted for:", firstName);
}

/* ============================
   CLICK SEND
============================= */
function clickSend() {
  console.log("📨 Looking for Send button...");
  let tries = 0;
  const interval = setInterval(() => {
    tries++;

    const allBtns = Array.from(document.querySelectorAll("button"));
    const sendBtn = allBtns.find((btn) => {
      const text = btn.innerText?.toLowerCase().trim();
      return (
        text === "send" ||
        text?.includes("send without") ||
        text?.includes("send now")
      );
    });
    if (sendBtn) {
      console.log("✅ Send FOUND in DOM");
      clearInterval(interval);
      sendBtn.click();
      sentCount++;
      index++;
      console.log(`🎉 Sent! 📊 ${sentCount} / ${MAX_CONNECTS}`);
      afterSend();
      return;
    }

    const host = document.querySelector("#interop-outlet");
    if (host?.shadowRoot) {
      const shadowBtns = Array.from(host.shadowRoot.querySelectorAll("button"));
      const shadowSend = shadowBtns.find((b) => {
        const text = b.innerText?.toLowerCase().trim();
        return (
          text === "send" ||
          text?.includes("send without") ||
          text?.includes("send now")
        );
      });
      if (shadowSend) {
        console.log("✅ Send FOUND in shadow DOM");
        clearInterval(interval);
        shadowSend.click();
        sentCount++;
        index++;
        console.log(`🎉 Sent! 📊 ${sentCount} / ${MAX_CONNECTS}`);
        afterSend();
        return;
      }
    }

    if (tries > 20) {
      console.log("❌ Send not found");
      clearInterval(interval);
      index++;
      afterSend();
    }
  }, 700);
}

/* ============================
   AFTER SEND
============================= */
function afterSend() {
  if (isBulkMode) {
    saveBulkContact();
  } else {
    // Single / sequence mode — save contact to DB
    saveContactToDatabase("", window.location.href);
    console.log("✅ Single/Campaign connect done");
    return;
  }

  const delay = Math.floor(Math.random() * (18000 - 10000)) + 10000;

  if (sentCount >= MAX_CONNECTS) {
    console.log("🎉 Max connects reached — stopping");
    isBulkMode = false;
    return;
  }

  if (index >= connectButtons.length) {
    goToNextPage(delay);
  } else {
    setTimeout(() => clickNext(), delay);
  }
}

/* ============================
   PAGINATION
============================= */
function goToNextPage(delay) {
  currentPage++;
  const url = new URL(window.location.href);
  const keywords =
    url.searchParams.get("keywords") ||
    sessionStorage.getItem("prosp_keywords") ||
    "";
  const cleanUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(keywords)}&page=${currentPage + 1}`;

  sessionStorage.setItem("prosp_bulk_running", "true");
  sessionStorage.setItem("prosp_sent_count", sentCount.toString());
  sessionStorage.setItem("prosp_page", currentPage.toString());
  sessionStorage.setItem("prosp_keywords", keywords);

  setTimeout(() => {
    window.open(cleanUrl, "_self", "noopener");
  }, delay);
}

/* ============================
   AUTO-RESUME after navigation
============================= */
setTimeout(() => {
  if (sessionStorage.getItem("prosp_bulk_running") === "true") {
    console.log("🔄 Auto-resuming bulk connect...");
    isBulkMode = true;
    startBulkConnect();
  }
}, 3000);

/* ============================
   SAVE CONTACT TO DATABASE
   - Called for single & sequence connects
   - Extracts all data from current profile page
   - Dispatches to bridge.js → background.js → API
============================= */
async function saveContactToDatabase(name, profileUrl) {
  try {
    let fullName = "";
    let firstName = "";
    let lastName = "";
    let position = "";
    let location = "";
    let company = "";
    let avatar = "";

    // --- Name (title is most reliable) ---
    const title = document.title;
    if (title && title.includes("|")) {
      fullName = title.split("|")[0].replace("LinkedIn", "").trim();
    }
    if (!fullName) {
      const h1 = document.querySelector("h1");
      if (h1?.innerText?.trim()) {
        fullName = h1.innerText.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
      }
    }
    if (!fullName) {
      const SKIP = [
        "Skip to main content",
        "Home",
        "My Network",
        "Jobs",
        "Messaging",
        "Notifications",
        "Me",
        "For Business",
        "Learning",
      ];
      const bodyLines = document.body.innerText
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 2);
      fullName =
        bodyLines.find((l) => !SKIP.includes(l) && l.length < 80) || "Unknown";
    }

    firstName = fullName.split(" ")[0] || "Unknown";
    lastName = fullName.split(" ").slice(1).join(" ") || "";

    // --- Headline → position + company (innerText line parsing — no CSS selectors) ---
    const fullText = document.body.innerText;
    const lines = fullText
      .split("\n")
      .map((l) => l.replace(/\s+/g, " ").trim())
      .filter((l) => l.length > 0);

    const NOISE = [
      "More",
      "Message",
      "Connect",
      "Follow",
      "- 3rd",
      "- 2nd",
      "- 1st",
      "About",
      "Contact info",
      "· 3rd",
      "· 2nd",
      "· 1st",
    ];
    const nameIndex = lines.findIndex(
      (l) => l === fullName || l.startsWith(fullName.split(" ")[0]),
    );

    let rawHeadline = "";
    if (nameIndex !== -1) {
      for (
        let i = nameIndex + 1;
        i < Math.min(nameIndex + 5, lines.length);
        i++
      ) {
        const line = lines[i];
        if (NOISE.some((n) => line.includes(n))) continue;
        if (line.length < 3 || line.length > 200) continue;
        rawHeadline = line;
        break;
      }
    }

    if (rawHeadline) {
      const parsed = parsePositionCompany(rawHeadline);
      position = parsed.position;
      company = parsed.company;
    }

    // --- Company fallback: Experience section ---
    if (!company) {
      const expIdx = lines.findIndex((l) => l === "Experience");
      if (expIdx !== -1) {
        for (let i = expIdx + 1; i < Math.min(expIdx + 6, lines.length); i++) {
          const line = lines[i];
          if (
            line.length > 3 &&
            line.length < 100 &&
            !NOISE.some((n) => line.includes(n)) &&
            !line.match(/^\d/) &&
            line !== fullName
          ) {
            company = line;
            break;
          }
        }
      }
    }

    // Clean company
    if (company) {
      company = company
        .replace(/Contact info/gi, "")
        .replace(/connections?/gi, "")
        .trim();
      if (company.length > 100) company = "";
    }

    // --- Location ---
    const LOCATION_KEYWORDS = [
      "India",
      "Bengaluru",
      "Chennai",
      "Mumbai",
      "Delhi",
      "Hyderabad",
      "Pune",
      "Canada",
      "United States",
      "United Kingdom",
      "Singapore",
      "Rajasthan",
      "Karnataka",
      "Maharashtra",
      "Bangalore",
      "Uttar Pradesh",
      "Bihar",
      "Gujarat",
      "Tamil Nadu",
      "Andhra Pradesh",
      "Telangana",
    ];

    const locationLine = lines.find(
      (l) =>
        l.length < 100 &&
        LOCATION_KEYWORDS.some((kw) => l.includes(kw)) &&
        !l.includes("Connect") &&
        !l.includes("Follow"),
    );
    if (locationLine) location = locationLine;

    // --- Avatar ---
    const avatarEl =
      document.querySelector("img.pv-top-card-profile-picture__image") ||
      document.querySelector(".pv-top-card-profile-picture img") ||
      document.querySelector("img[data-delayed-url]") ||
      document.querySelector("img.presence-entity__image");
    if (avatarEl) {
      avatar = avatarEl.src || avatarEl.getAttribute("data-delayed-url") || "";
    }

    const payload = {
      firstName,
      lastName,
      fullName,
      linkedinUrl: profileUrl || window.location.href,
      position,
      company,
      location,
      avatar,
    };

    console.log("🚀 Preparing to save:", payload);

    window.dispatchEvent(
      new CustomEvent("prosp_save_contact", { detail: payload }),
    );

    console.log("📡 Dispatched to bridge for storage");
  } catch (err) {
    console.error("❌ saveContactToDatabase failed:", err);
  }
}

window.clickConnectButton = clickConnectButton;
