export const SELECTORS = {
  profileCards: [
    "li.reusable-search__result-container",
    ".entity-result",
    ".artdeco-entity-lockup",
    ".linked-area",
  ],

  profileLinks: ['a[href*="/in/"]'],

  connectButtons: [
    'button[aria-label*="Connect"]',
    'button:has(span:contains("Connect"))',
  ],

  nameElements: ["span[dir='ltr']", ".entity-result__title-text"],
};
