console.log("🔥 CONTENT JS LOADED");
console.log("🔥 Prosp content.js injected successfully");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function randomDelay(min, max) {
  const time = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, time));
}

let connectButtons = [];
let index = 0;
let currentPage = 0;
let isBulkMode = false;
const MAX_CONNECTS = 25;
let sentCount = 0;
const MIN_DELAY = 15000;
const MAX_DELAY = 45000;
const DEFAULT_MESSAGE = `Hi {firstName},\n\nCame across your profile and would love to connect!\n\nBest,\nTejeshwar`;

function checkWeeklyLimit() {
  return document.body.innerText.toLowerCase().includes("weekly limit");
}

function parsePositionCompany(text) {
  if (!text) return { position: "", company: "" };
  text = text.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
  for (const sep of [" at ", " @ ", " | ", " • "]) {
    if (text.includes(sep)) {
      const parts = text.split(sep);
      return {
        position: parts[0].trim(),
        company: parts.slice(1).join(sep).trim(),
      };
    }
  }
  return { position: text.trim(), company: "" };
}

function extractHeadlineFromCard(card) {
  if (!card) return "";
  const sels = [
    '[data-field="headline"]',
    ".entity-result__primary-subtitle",
    ".entity-result__secondary-subtitle",
    ".artdeco-entity-lockup__subtitle",
    ".artdeco-entity-lockup__caption",
  ];
  for (const sel of sels) {
    const text = card.querySelector(sel)?.innerText?.trim();
    if (text && text.length > 2 && text.length < 150) return text;
  }
  return "";
}

/* ============================
   SEARCH RESULTS IMPORTER
   Core logic: find profile links on the page
============================= */
const IMPORT_LIMIT = 25;

// ── THE KEY FIX: find cards by profile links, not by container selectors ──
function getProfileCards() {
  const allLinks = Array.from(
    document.querySelectorAll('a[href*="linkedin.com/in/"], a[href^="/in/"]'),
  );
  console.log(`🔗 Total /in/ links on page: ${allLinks.length}`);

  const cards = [];
  const seenHrefs = new Set();

  for (const link of allLinks) {
    let href = link.href || "";
    // Normalise relative URLs
    if (href.startsWith("/in/")) href = "https://www.linkedin.com" + href;
    href = href.split("?")[0].replace(/\/$/, "");

    if (seenHrefs.has(href)) continue;
    if (!href.includes("/in/") || href === "https://www.linkedin.com/in")
      continue;

    // Skip nav/header/sidebar links — they are usually inside <nav> or have very short text
    const linkText = link.innerText?.trim().replace(/\s+/g, " ") || "";
    if (linkText.length < 2) continue;

    // Skip if link is inside navigation elements
    let inNav = false;
    let p = link.parentElement;
    for (let i = 0; i < 6; i++) {
      if (!p) break;
      const tag = p.tagName?.toLowerCase();
      if (tag === "nav" || tag === "header" || tag === "footer") {
        inNav = true;
        break;
      }
      if (p.getAttribute("role") === "navigation") {
        inNav = true;
        break;
      }
      p = p.parentElement;
    }
    if (inNav) continue;

    // Walk up to find a result card container
    let container = link.parentElement;
    for (let i = 0; i < 10; i++) {
      if (!container) break;
      const h = container.offsetHeight;
      const txt = container.innerText?.length || 0;
      if (h > 80 && txt > 50) break;
      container = container.parentElement;
    }

    if (container) {
      seenHrefs.add(href);
      cards.push({ container, linkedinUrl: href, link });
    }
  }

  console.log(`📋 Profile cards found: ${cards.length}`);
  return cards;
}

async function waitForCards(maxWait = 15000) {
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    const links = document.querySelectorAll('a[href*="linkedin.com/in/"]');
    const validLinks = Array.from(links).filter((l) => {
      const href = l.href;
      return href.includes("/in/") && l.innerText?.trim().length > 1;
    });
    if (validLinks.length >= 3) {
      console.log(`✅ Cards ready — found ${validLinks.length} profile links`);
      return true;
    }
    console.log(`⏳ Waiting for cards... found ${validLinks.length} so far`);
    await sleep(1500);
  }
  console.log("⚠️ Timed out waiting for cards");
  return false;
}

async function scrapeCurrentPage(campaignId, importedSoFar, seenUrls) {
  console.log(`🔍 scrapeCurrentPage — URL: ${window.location.href}`);

  // Scroll to trigger lazy loading
  for (let i = 0; i < 4; i++) {
    window.scrollTo(0, document.body.scrollHeight * ((i + 1) / 4));
    console.log(`📜 Scrolling... ${i + 1} / 4`);
    await sleep(1800);
  }
  window.scrollTo(0, 0);
  await sleep(800);

  const cards = getProfileCards();
  console.log(`👀 Cards found: ${cards.length}`);

  if (cards.length === 0) {
    console.log("❌ No cards found. DOM sample:");
    console.log(document.body.innerHTML.substring(0, 500));
    return 0;
  }

  let pageImported = 0;

  for (const { container, linkedinUrl, link } of cards) {
    if (importedSoFar + pageImported >= IMPORT_LIMIT) break;
    if (seenUrls.has(linkedinUrl)) {
      console.log(`⏭️ Skip duplicate: ${linkedinUrl}`);
      continue;
    }
    seenUrls.add(linkedinUrl);

    try {
      // ── Name ──
      let fullName = "";

      // Try dedicated name selectors first (most reliable)
      const nameSels = [
        '[data-field="full_name"]',
        ".entity-result__title-text a span[aria-hidden='true']",
        ".entity-result__title-text span[aria-hidden='true']",
        ".artdeco-entity-lockup__title span[aria-hidden='true']",
        'span[aria-hidden="true"]',
      ];
      for (const sel of nameSels) {
        const el = container.querySelector(sel);
        const t = el?.innerText?.trim().split("\n")[0];
        if (
          t &&
          t.length > 1 &&
          t.length < 80 &&
          !t.includes("LinkedIn Member")
        ) {
          fullName = t;
          break;
        }
      }

      // Fallback: use link text but clean it up
      if (!fullName) {
        fullName = link.innerText?.trim().split("\n")[0] || "";
      }

      // Fallback: parse from URL slug
      if (!fullName || fullName.includes("LinkedIn Member")) {
        const slug = linkedinUrl.split("/in/")[1]?.split("/")[0] || "";
        fullName = slug
          .replace(/-/g, " ")
          .replace(/\d+/g, "")
          .trim()
          .replace(/\b\w/g, (c) => c.toUpperCase());
      }

      // ── Clean the name ──
      fullName = fullName
        .replace(/•\s*(1st|2nd|3rd|\d+st|\d+nd|\d+rd|[\d]+)\s*$/i, "") // remove "• 2nd", "• 1st"
        .replace(/[\u2022\u00b7]\s*(1st|2nd|3rd)/gi, "") // remove bullet + degree
        .replace(/\s*[-–]\s*(1st|2nd|3rd)/gi, "") // remove "- 2nd"
        .replace(/\(.*?\)/g, "") // remove (anything)
        .replace(/\s{2,}/g, " ") // collapse spaces
        .trim();

      const parts = fullName.split(" ");
      const firstName = parts[0] || "Unknown";
      const lastName = parts.slice(1).join(" ");

      // ── Headline → position + company ──
      // Try multiple selectors aggressively
      let headline = "";
      const headlineSels = [
        '[data-field="headline"]',
        ".entity-result__primary-subtitle",
        ".entity-result__secondary-subtitle",
        ".artdeco-entity-lockup__subtitle",
        ".artdeco-entity-lockup__caption",
        ".entity-result__summary",
      ];
      for (const sel of headlineSels) {
        const t = container.querySelector(sel)?.innerText?.trim();
        if (t && t.length > 2 && t.length < 200) {
          headline = t;
          break;
        }
      }

      // Fallback: look for "at" / "|" / "•" pattern in container text lines
      if (!headline) {
        const lines = (container.innerText || "")
          .split("\n")
          .map((l) => l.replace(/\s+/g, " ").trim())
          .filter((l) => l.length > 3 && l.length < 200);
        const nameIdx = lines.findIndex((l) => l.startsWith(firstName));
        if (nameIdx !== -1) {
          for (
            let i = nameIdx + 1;
            i < Math.min(nameIdx + 4, lines.length);
            i++
          ) {
            const l = lines[i];
            if (
              l.includes(" at ") ||
              l.includes(" | ") ||
              l.includes(" @ ") ||
              /engineer|manager|director|founder|ceo|cto|developer|analyst|consultant/i.test(
                l,
              )
            ) {
              headline = l;
              break;
            }
          }
        }
      }

      const { position, company } = parsePositionCompany(headline);

      // ── Location ──
      let location = "";
      const locEl = container.querySelector(
        ".entity-result__secondary-subtitle, [data-field='secondary_subtitle'], .artdeco-entity-lockup__caption",
      );
      if (locEl) {
        const t = locEl.innerText?.trim();
        if (t && !t.includes(" at ") && !t.includes(" | ")) location = t;
      }

      // ── Avatar ──
      let avatar = "";
      const img = container.querySelector("img");
      if (img) avatar = img.src || img.getAttribute("data-delayed-url") || "";

      const payload = {
        firstName,
        lastName,
        fullName,
        linkedinUrl,
        position,
        company,
        location,
        avatar,
        campaignId,
        userEmail: "",
        source: "linkedin_search",
      };

      console.log(
        `📦 CONTACT: ${firstName} ${lastName} | ${company} | ${linkedinUrl}`,
      );
      window.dispatchEvent(
        new CustomEvent("prosp_save_contact", { detail: payload }),
      );
      pageImported++;
      await randomDelay(200, 500);
    } catch (err) {
      console.error("❌ Card parse error:", err);
    }
  }

  return pageImported;
}

function buildPageUrl(pageNum) {
  const url = new URL(window.location.href);
  url.searchParams.set("page", pageNum);
  // Keep only essential params
  const keywords = url.searchParams.get("keywords") || "";
  const newUrl = new URL("https://www.linkedin.com/search/results/people/");
  if (keywords) newUrl.searchParams.set("keywords", keywords);
  newUrl.searchParams.set("page", pageNum);
  return newUrl.toString();
}

function getCurrentPageNum() {
  const url = new URL(window.location.href);
  return parseInt(url.searchParams.get("page") || "1");
}

function hasNextPage() {
  const currentPage = getCurrentPageNum();
  // Check Next button
  const nextBtnSels = [
    'button[aria-label="Next"]',
    "button.artdeco-pagination__button--next",
  ];
  for (const sel of nextBtnSels) {
    const btn = document.querySelector(sel);
    if (btn && !btn.disabled) return true;
  }
  // Check via text
  const found = Array.from(document.querySelectorAll("button")).find((b) => {
    const t = b.innerText?.trim().toLowerCase();
    const a = (b.getAttribute("aria-label") || "").toLowerCase();
    return (t === "next" || a === "next") && !b.disabled;
  });
  if (found) return true;
  // Check if page numbers go higher
  const pageBtns = Array.from(
    document.querySelectorAll(
      "li.artdeco-pagination__indicator--number button, [data-test-pagination-page-btn]",
    ),
  );
  return pageBtns.some((b) => {
    const n = parseInt(b.innerText?.trim() || "0");
    return n > currentPage;
  });
}

async function scrapeSearchResults(campaignId) {
  console.log(
    `🚀 SEARCH SCRAPE START | campaign: ${campaignId} | limit: ${IMPORT_LIMIT}`,
  );
  console.log(`📍 Current URL: ${window.location.href}`);

  // Wait for page to be ready
  await waitForCards(12000);

  const seenUrls = new Set();
  let totalImported = 0;

  // ── Resume state from sessionStorage ──
  const savedImported = sessionStorage.getItem("prosp_scrape_imported");
  const savedSeen = sessionStorage.getItem("prosp_scrape_seen");
  const savedCampaign = sessionStorage.getItem("prosp_scrape_campaignId");

  if (savedImported && savedCampaign) {
    totalImported = parseInt(savedImported) || 0;
    campaignId = savedCampaign;
    if (savedSeen) {
      try {
        JSON.parse(savedSeen).forEach((u) => seenUrls.add(u));
      } catch (e) {}
    }
    console.log(
      `🔄 Resumed — already imported: ${totalImported}, page: ${getCurrentPageNum()}`,
    );
  }

  // Clear resume state immediately
  sessionStorage.removeItem("prosp_scrape_running");
  sessionStorage.removeItem("prosp_scrape_campaignId");
  sessionStorage.removeItem("prosp_scrape_imported");
  sessionStorage.removeItem("prosp_scrape_seen");

  // ── Scrape this page ──
  const pageImported = await scrapeCurrentPage(
    campaignId,
    totalImported,
    seenUrls,
  );
  totalImported += pageImported;
  console.log(
    `✅ Page ${getCurrentPageNum()} done | this page: ${pageImported} | total: ${totalImported}`,
  );

  // ── Decide whether to continue ──
  if (totalImported >= IMPORT_LIMIT) {
    console.log(`🎉 Limit reached — total: ${totalImported}`);
    return { success: true, count: totalImported };
  }

  if (pageImported === 0) {
    console.log("⚠️ Nothing scraped on this page — stopping");
    return { success: true, count: totalImported };
  }

  if (!hasNextPage()) {
    console.log("📄 No next page — done");
    return { success: true, count: totalImported };
  }

  // ── Navigate to next page ──
  const nextPage = getCurrentPageNum() + 1;
  const nextUrl = buildPageUrl(nextPage);

  console.log(`➡️ Saving state and going to page ${nextPage}: ${nextUrl}`);

  sessionStorage.setItem("prosp_scrape_running", "true");
  sessionStorage.setItem("prosp_scrape_campaignId", campaignId);
  sessionStorage.setItem("prosp_scrape_imported", totalImported.toString());
  sessionStorage.setItem("prosp_scrape_seen", JSON.stringify([...seenUrls]));

  await sleep(1000); // let last save events fire
  window.location.href = nextUrl;
}

// ── Auto-resume on page load ──
setTimeout(async () => {
  if (sessionStorage.getItem("prosp_scrape_running") === "true") {
    console.log("🔄 AUTO-RESUME triggered on new page load");
    const campaignId = sessionStorage.getItem("prosp_scrape_campaignId");
    if (campaignId) await scrapeSearchResults(campaignId);
  }
}, 5000);

/* ============================
   CONNECT AUTOMATION (unchanged)
============================= */
function findMainConnectButton() {
  const mainEl = document.querySelector("main");
  if (!mainEl) return null;
  const profileCardButtons = Array.from(
    mainEl.querySelectorAll("button"),
  ).filter(
    (b) => b.offsetParent !== null && b.getBoundingClientRect().left < 700,
  );
  const directConnect = profileCardButtons.find((b) => {
    const text = b.innerText?.trim().toLowerCase() || "";
    const aria = (b.getAttribute("aria-label") || "").toLowerCase();
    return text === "connect" || aria.includes("connect");
  });
  if (directConnect?.innerText?.toLowerCase().includes("follow")) return null;
  if (directConnect) return directConnect;
  const moreBtn = profileCardButtons.find(
    (b) => b.innerText?.trim() === "More" && !b.getAttribute("aria-label"),
  );
  if (moreBtn) {
    moreBtn.click();
    return new Promise((resolve) => {
      let tries = 0;
      const iv = setInterval(() => {
        tries++;
        const spans = Array.from(document.querySelectorAll("span")).filter(
          (s) =>
            s.children.length === 0 &&
            s.innerText?.trim() === "Connect" &&
            s.offsetParent !== null,
        );
        for (const span of spans) {
          let el = span.parentElement;
          let d = 0;
          while (el && d < 8) {
            if (
              (el.tagName === "BUTTON" || el.tagName === "A") &&
              el.getBoundingClientRect().left < 700
            ) {
              clearInterval(iv);
              resolve(el);
              return;
            }
            el = el.parentElement;
            d++;
          }
        }
        if (tries > 15) {
          clearInterval(iv);
          resolve(null);
        }
      }, 400);
    });
  }
  return null;
}

function clickConnectButton() {
  try {
    const fullName = document.title
      .replace(/\s*[\|\-]\s*(LinkedIn.*)?$/i, "")
      .trim();
    if (fullName?.length > 1) {
      window.currentFirstName = fullName.split(" ")[0];
      window.currentFirstName =
        window.currentFirstName.charAt(0).toUpperCase() +
        window.currentFirstName.slice(1).toLowerCase();
    }
  } catch (e) {}
  let attempts = 0;
  const tryFind = () => {
    attempts++;
    Promise.resolve(findMainConnectButton()).then((btn) => {
      if (btn) {
        const body = document.body.innerText.toLowerCase();
        if (body.includes("pending") || body.includes("remove connection"))
          return;
        btn.click();
        setTimeout(() => saveContactToDatabase("", window.location.href), 1000);
        setTimeout(() => clickAddNote(), 2500);
      } else if (attempts < 20) {
        setTimeout(tryFind, 500);
      } else {
        saveContactToDatabase("", window.location.href);
      }
    });
  };
  tryFind();
}
window.clickConnectButton = clickConnectButton;

function startBulkConnect() {
  index = 0;
  const savedCount = sessionStorage.getItem("prosp_sent_count");
  if (savedCount) {
    sentCount = parseInt(savedCount);
    currentPage = parseInt(sessionStorage.getItem("prosp_page") || "0");
    [
      "prosp_sent_count",
      "prosp_page",
      "prosp_keywords",
      "prosp_bulk_running",
    ].forEach((k) => sessionStorage.removeItem(k));
  } else {
    sentCount = 0;
    currentPage = 0;
  }
  autoScrollAndCollect();
}

function autoScrollAndCollect() {
  isBulkMode = true;
  let lastHeight = 0,
    attempts = 0;
  const iv = setInterval(() => {
    window.scrollTo(0, document.body.scrollHeight);
    const h = document.body.scrollHeight;
    if (h === lastHeight) attempts++;
    else attempts = 0;
    lastHeight = h;
    if (attempts > 5) {
      clearInterval(iv);
      setTimeout(collectConnectButtons, 3000);
    }
  }, 2000);
}

function collectConnectButtons() {
  connectButtons = Array.from(document.querySelectorAll("span")).filter(
    (el) => el.innerText?.trim() === "Connect",
  );
  window.bulkContactData = connectButtons.map((el) => {
    let card = el.parentElement;
    for (let j = 0; j < 10; j++) {
      if (!card || card.querySelector('a[href*="/in/"]')) break;
      card = card.parentElement;
    }
    const linkEl = card?.querySelector('a[href*="/in/"]');
    const linkedinUrl = linkEl ? linkEl.href.split("?")[0] : "";
    let firstName = "Unknown",
      lastName = "";
    if (linkedinUrl) {
      const words = (linkedinUrl.split("/in/")[1]?.replace(/\/$/, "") || "")
        .replace(/-[a-z0-9]{4,}$/i, "")
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1));
      firstName = words[0] || "Unknown";
      lastName = words.slice(1).join(" ");
    }
    const headline = extractHeadlineFromCard(card);
    const { position, company } = parsePositionCompany(headline);
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
  if (connectButtons.length === 0) {
    goToNextPage(5000);
    return;
  }
  clickNext();
}

const savedUrls = new Set();
function saveBulkContact() {
  const d = window.bulkContactData?.[index - 1];
  if (!d || (d.linkedinUrl && savedUrls.has(d.linkedinUrl))) return;
  if (d.linkedinUrl) savedUrls.add(d.linkedinUrl);
  window.dispatchEvent(new CustomEvent("prosp_save_contact", { detail: d }));
}

async function clickNext() {
  if (index >= connectButtons.length || sentCount >= MAX_CONNECTS) {
    isBulkMode = false;
    return;
  }
  if (checkWeeklyLimit()) return;
  const btn = connectButtons[index];
  if (!btn) {
    index++;
    setTimeout(clickNext, 5000);
    return;
  }
  if (window.bulkContactData?.[index])
    window.currentFirstName = window.bulkContactData[index].firstName;
  btn.scrollIntoView({ block: "center" });
  await randomDelay(1000, 1500);
  const rect = btn.getBoundingClientRect();
  window.dispatchEvent(
    new CustomEvent("prosp_click_coords", {
      detail: {
        x: Math.round(rect.left + rect.width / 2),
        y: Math.round(rect.top + rect.height / 2),
      },
    }),
  );
  await randomDelay(2000, 3000);
  clickAddNote();
}

function clickAddNote() {
  let tries = 0;
  const iv = setInterval(() => {
    tries++;
    const btns = Array.from(
      document.querySelectorAll('button,[role="button"]'),
    );
    const addNote = btns.find(
      (b) => b.innerText?.toLowerCase().trim() === "add a note",
    );
    if (addNote) {
      clearInterval(iv);
      addNote.click();
      setTimeout(insertMessage, 1800);
      return;
    }
    const sendWithout = btns.find((b) =>
      b.innerText?.toLowerCase().trim()?.includes("send without"),
    );
    if (sendWithout) {
      clearInterval(iv);
      sendWithout.click();
      if (isBulkMode) {
        sentCount++;
        index++;
      }
      afterSend();
      return;
    }
    const host = document.querySelector("#interop-outlet");
    if (host?.shadowRoot) {
      const sBtns = Array.from(host.shadowRoot.querySelectorAll("button"));
      const sAdd = sBtns.find((b) =>
        b.innerText?.toLowerCase().includes("add a note"),
      );
      if (sAdd) {
        clearInterval(iv);
        sAdd.click();
        setTimeout(insertMessage, 1800);
        return;
      }
      const sSend = sBtns.find(
        (b) =>
          b.innerText?.toLowerCase().includes("send without") ||
          b.innerText?.toLowerCase().trim() === "send",
      );
      if (sSend) {
        clearInterval(iv);
        sSend.click();
        if (isBulkMode) {
          sentCount++;
          index++;
        }
        afterSend();
        return;
      }
    }
    if (tries > 25) {
      clearInterval(iv);
      index++;
      if (!isBulkMode) {
        saveContactToDatabase("", window.location.href);
        return;
      }
      const delay = Math.floor(Math.random() * 7000) + 8000;
      if (index >= connectButtons.length) goToNextPage(delay);
      else setTimeout(clickNext, delay);
    }
  }, 700);
}

function insertMessage() {
  let tries = 0;
  const iv = setInterval(() => {
    tries++;
    const ta = document.querySelector("textarea");
    if (ta) {
      clearInterval(iv);
      fillMessage(ta);
      setTimeout(clickSend, 2000);
      return;
    }
    const host = document.querySelector("#interop-outlet");
    if (host?.shadowRoot) {
      const sta = host.shadowRoot.querySelector("textarea");
      if (sta) {
        clearInterval(iv);
        fillMessage(sta);
        setTimeout(clickSend, 2000);
        return;
      }
    }
    if (tries > 20) {
      clearInterval(iv);
      clickSend();
    }
  }, 700);
}

function fillMessage(ta) {
  let fn = window.currentFirstName || "there";
  fn = fn.charAt(0).toUpperCase() + fn.slice(1).toLowerCase();
  const msg = (window.campaignMessage || DEFAULT_MESSAGE)
    .replace("{firstName}", fn)
    .replace("{{firstName}}", fn);
  ta.focus();
  ta.value = msg;
  ta.dispatchEvent(new Event("input", { bubbles: true }));
  ta.dispatchEvent(new Event("change", { bubbles: true }));
}

function clickSend() {
  let tries = 0;
  const iv = setInterval(() => {
    tries++;
    const sendBtn = Array.from(document.querySelectorAll("button")).find(
      (b) => {
        const t = b.innerText?.toLowerCase().trim();
        return t === "send" || t?.includes("send without");
      },
    );
    if (sendBtn) {
      clearInterval(iv);
      sendBtn.click();
      if (isBulkMode) {
        sentCount++;
        index++;
      }
      afterSend();
      return;
    }
    const host = document.querySelector("#interop-outlet");
    if (host?.shadowRoot) {
      const ss = Array.from(host.shadowRoot.querySelectorAll("button")).find(
        (b) => {
          const t = b.innerText?.toLowerCase().trim();
          return t === "send" || t?.includes("send without");
        },
      );
      if (ss) {
        clearInterval(iv);
        ss.click();
        if (isBulkMode) {
          sentCount++;
          index++;
        }
        afterSend();
        return;
      }
    }
    if (tries > 20) {
      clearInterval(iv);
      index++;
      afterSend();
    }
  }, 700);
}

function afterSend() {
  if (isBulkMode) {
    saveBulkContact();
    const delay =
      Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY)) + MIN_DELAY;
    if (sentCount >= MAX_CONNECTS) {
      isBulkMode = false;
      return;
    }
    if (index >= connectButtons.length) goToNextPage(delay);
    else setTimeout(clickNext, delay);
  } else {
    saveContactToDatabase("", window.location.href);
    fetch("http://localhost:3000/api/contacts/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        linkedinUrl: window.location.href,
        status: "CONNECTED",
      }),
    }).catch(() => {});
  }
}

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

setTimeout(() => {
  if (sessionStorage.getItem("prosp_bulk_running") === "true") {
    isBulkMode = true;
    startBulkConnect();
  }
}, 3000);

async function saveContactToDatabase(name, profileUrl) {
  try {
    let fullName = document.title.includes("|")
      ? document.title.split("|")[0].replace("LinkedIn", "").trim()
      : document.querySelector("h1")?.innerText?.trim() || "Unknown";
    const firstName = fullName.split(" ")[0] || "Unknown";
    const lastName = fullName.split(" ").slice(1).join(" ") || "";
    window.dispatchEvent(
      new CustomEvent("prosp_save_contact", {
        detail: {
          firstName,
          lastName,
          fullName,
          linkedinUrl: profileUrl || window.location.href,
          position: "",
          company: "",
          location: "",
          avatar: "",
          userEmail: "",
        },
      }),
    );
  } catch (err) {
    console.error("❌ saveContactToDatabase:", err);
  }
}

/* ============================
   MESSAGE LISTENERS
============================= */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("📩 CONTENT MESSAGE RECEIVED:", message);
  if (message.action === "scrape_search_results") {
    console.log(
      `🚀 STARTING IMPORT | type: ${message.importType || "linkedin_search"}`,
    );
    const importType = message.importType || "linkedin_search";
    const campaignId = message.campaignId;

    // Route to correct scraper based on importType
    let promise;
    if (importType === "linkedin_event") {
      promise = scrapeEventPage(campaignId);
    } else if (importType === "linkedin_post") {
      promise = scrapePostPage(campaignId);
    } else if (importType === "linkedin_group") {
      promise = scrapeGroupPage(campaignId);
    } else {
      // linkedin_search, sales_navigator, lead_finder
      promise = scrapeSearchResults(campaignId);
    }

    promise.then((result) => sendResponse(result || { success: true }));
    return true;
  }
  if (message.action === "connect") {
    isBulkMode = false;
    if (message.message) window.campaignMessage = message.message;
    clickConnectButton();
    sendResponse({ success: true });
    return true;
  }
  if (message.action === "start_bulk_connect") {
    isBulkMode = true;
    startBulkConnect();
    sendResponse({ success: true });
    return true;
  }
  return true;
});

window.addEventListener("prosp_action", (event) => {
  const msg = event.detail;
  if (msg.action === "connect") {
    isBulkMode = false;
    if (msg.message) window.campaignMessage = msg.message;
    clickConnectButton();
  }
  if (msg.action === "start_bulk_connect") {
    isBulkMode = true;
    startBulkConnect();
  }
  if (msg.action === "scrape_search_results")
    scrapeSearchResults(msg.campaignId);
});

/* ============================
   EXTRA SCRAPERS for Event / Post / Group
   These are triggered by importType in the message
============================= */

// ── LinkedIn Event: scrape attendees ──
async function scrapeEventPage(campaignId) {
  console.log("🎪 Scraping LinkedIn Event attendees...");
  await sleep(4000);

  // Navigate to the attendees tab if not already there
  const attendeeLinks = [
    ...Array.from(document.querySelectorAll('a[href*="attendees"]')),
    ...Array.from(document.querySelectorAll("a")).filter((a) =>
      a.innerText?.toLowerCase().includes("attendee"),
    ),
  ];
  if (attendeeLinks.length > 0) {
    console.log("➡️ Clicking attendees link");
    attendeeLinks[0].click();
    await sleep(3000);
  }

  return scrapeSearchResults(campaignId);
}

// ── LinkedIn Post: scrape likers + commenters ──
async function scrapePostPage(campaignId) {
  console.log("📝 Scraping LinkedIn Post reactions/comments...");
  await sleep(4000);

  // Try to open reactions modal
  const reactionBtns = Array.from(
    document.querySelectorAll("button, span"),
  ).filter((el) => {
    const t = el.innerText?.toLowerCase();
    return (
      t?.includes("like") ||
      t?.includes("reaction") ||
      t?.match(/^\d+\s*(like|reaction)/)
    );
  });
  if (reactionBtns.length > 0) {
    console.log("👍 Clicking reactions button");
    reactionBtns[0].click();
    await sleep(2000);
  }

  // Scrape profile links visible in the modal or page
  return scrapeSearchResults(campaignId);
}

// ── LinkedIn Group: scrape members ──
async function scrapeGroupPage(campaignId) {
  console.log("👥 Scraping LinkedIn Group members...");
  await sleep(4000);

  // Navigate to members tab
  const memberLinks = Array.from(document.querySelectorAll("a")).filter(
    function (a) {
      const href = a.href || "";
      const text = a.innerText ? a.innerText.toLowerCase() : "";
      return href.includes("/members") || text.includes("member");
    },
  );
  if (memberLinks.length > 0) {
    console.log("➡️ Navigating to members page");
    window.location.href = memberLinks[0].href;
    return; // page will reload, scrapeSearchResults handles the rest via sessionStorage
  }

  return scrapeSearchResults(campaignId);
}
