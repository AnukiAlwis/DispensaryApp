/**
 * Shared frequency-parsing utilities for prescription items.
 *
 * `parseFrequency` converts a human-readable frequency string (either a
 * predefined option or doctor-entered free text) into a "times per day"
 * number used to calculate the quantity to dispense.
 */

/**
 * Maps known keyword phrases to how many times per day the dose is taken.
 * Order matters: more specific phrases are checked before generic ones.
 */
const KEYWORD_TIMES_PER_DAY: Array<{ pattern: RegExp; timesPerDay: number }> = [
  { pattern: /every\s*4\s*hours?/, timesPerDay: 6 },
  { pattern: /every\s*6\s*hours?/, timesPerDay: 4 },
  { pattern: /every\s*8\s*hours?/, timesPerDay: 3 },
  { pattern: /every\s*12\s*hours?/, timesPerDay: 2 },
  { pattern: /once\s*(a\s*)?day|once\s*daily|od\b/, timesPerDay: 1 },
  { pattern: /twice\s*(a\s*)?day|twice\s*daily|bd\b|bid\b/, timesPerDay: 2 },
  { pattern: /thrice\s*(a\s*)?day|three\s*times|tds\b|tid\b/, timesPerDay: 3 },
  { pattern: /four\s*times|qid\b/, timesPerDay: 4 },
  { pattern: /at\s*bedtime|bedtime|nocte/, timesPerDay: 1 },
  { pattern: /after\s*meals|before\s*meals/, timesPerDay: 3 },
];

/**
 * Converts a frequency description into a numeric "times per day" value.
 * Falls back to explicit "N times" patterns, then defaults to 1 if the
 * frequency cannot be confidently parsed.
 */
export const parseFrequency = (freq: string): number => {
  if (!freq) return 1;
  const lower = freq.toLowerCase().trim();

  for (const { pattern, timesPerDay } of KEYWORD_TIMES_PER_DAY) {
    if (pattern.test(lower)) return timesPerDay;
  }

  // Generic fallback for free-text entries like "3 times daily" or "5 times"
  const numericMatch = lower.match(/(\d+)\s*times?/);
  if (numericMatch) {
    const parsed = parseInt(numericMatch[1], 10);
    if (!Number.isNaN(parsed) && parsed > 0) return parsed;
  }

  return 1;
};

/**
 * Extracts the numeric dose amount from dosage text (e.g. "1.5 tablets" -> 1.5).
 * Supports up to 2 decimal places; defaults to 1 if no number is present.
 */
export const parseDosageUnits = (dosage: string): number => {
  const match = dosage.match(/\d+(\.\d{1,2})?/);
  const parsed = match ? parseFloat(match[0]) : NaN;
  return !Number.isNaN(parsed) && parsed > 0 ? parsed : 1;
};

/**
 * Calculates the total quantity to dispense given dosage text (e.g. "1.5 tablets"),
 * a frequency description, and the duration in days.
 *
 * The result is rounded up (ceiling) since partial pills cannot be dispensed.
 */
export const calculateQuantity = (
  dosage: string,
  frequency: string,
  duration: number
): number => {
  const units = parseDosageUnits(dosage);
  const timesPerDay = parseFrequency(frequency);
  return Math.ceil(units * timesPerDay * duration);
};
