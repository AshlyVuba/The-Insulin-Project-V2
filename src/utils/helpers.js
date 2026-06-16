/**
 * Format a date string for display
 * @param {string} dateStr - ISO date string e.g. "2025-06-16"
 * @returns {string} e.g. "Mon, 16 Jun 2025"
 */
export function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

/**
 * Get initials from a full name
 * @param {string} name
 * @returns {string} e.g. "ND"
 */
export function getInitials(name = "") {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

/**
 * Sanitize input to prevent XSS
 * @param {string} str
 * @returns {string}
 */
export function sanitize(str = "") {
  return str.replace(/[<>"'&]/g, (c) => ({ "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;", "&":"&amp;" }[c]));
}
