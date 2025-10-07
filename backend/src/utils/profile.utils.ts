/**
 * Splits a value into an array of skill strings.
 * - If `val` is falsy (null/undefined/empty), return an empty array.
 * - If `val` is already an array, ensure all items are strings and trim whitespace.
 * - Otherwise, assume it's a comma-separated string and split into an array.
 */
export const splitSkills = (val: any): string[] => {
  if (!val) return []; // No value → return empty array
  if (Array.isArray(val)) return val.map((s) => String(s).trim()); // Convert array items to trimmed strings
  return String(val) // Ensure the value is a string
    .split(',') // Split by commas
    .map((s) => s.trim()) // Trim spaces from each skill
    .filter(Boolean); // Remove empty values (e.g. "", " ")
};

/**
 * Joins an array of skills into a single comma-separated string.
 * - If `skills` is falsy, return null.
 * - If it's an array, convert items to strings, trim them, and join with ", ".
 * - Otherwise, assume it's a string and just trim it.
 */
export const joinSkills = (skills: any): string | null => {
  if (!skills) return null; // No value → return null
  if (Array.isArray(skills)) return skills.map((s) => String(s).trim()).join(', '); // Join array into CSV
  return String(skills).trim(); // Return trimmed single string
};

/**
 * Extracts and normalizes timestamp fields from a record.
 * - Returns an object with `created_at` and `updated_at`.
 * - If a timestamp field is missing, set it to `undefined` instead of null.
 */
export const mapTimestamps = (r: any) => ({
  created_at: r.created_at || undefined,
  updated_at: r.updated_at || undefined,
});