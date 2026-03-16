export function mapTagColor(tag: string): string {
  const normalized = tag.toLowerCase();

  if (/(react|frontend|ui|web)/.test(normalized)) return "react";
  if (/(mobile|ios|android|flutter|dart)/.test(normalized)) return "mobile";
  if (/(backend|api|node|server|database|devops|cloud)/.test(normalized))
    return "web";
  if (/(security|compliance|risk)/.test(normalized)) return "ios";
  if (/(lead|manager|director|executive)/.test(normalized)) return "android";

  return "flutter";
}
