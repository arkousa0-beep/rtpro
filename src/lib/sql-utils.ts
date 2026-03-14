/**
 * Sanitizes a string for use in a SQL LIKE or ILIKE pattern.
 * Escapes special characters: %, _, and \.
 */
export function sanitizeLikePattern(pattern: string | null | undefined): string {
  if (!pattern) return "";
  return pattern.replace(/[\\%_]/g, "\\$&");
}
