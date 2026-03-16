export function getInitials(value: string, fallback = "U"): string {
  const parts = value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) return fallback;

  return parts.map((part) => part.charAt(0).toUpperCase()).join("");
}
