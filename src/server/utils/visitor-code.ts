/**
 * Returns the two-digit year prefix used in visitor codes (e.g. 2026 → "26").
 */
export function getVisitorCodeYearPrefix(date: Date = new Date()): string {
  return String(date.getFullYear()).slice(-2);
}

/**
 * Formats a sequence number into the visitor code suffix (e.g. 1 → "001").
 */
export function formatVisitorCodeSequence(sequence: number): string {
  return String(sequence).padStart(3, "0");
}

/**
 * Builds a complete visitor code from year prefix and sequence (e.g. "26", 1 → "26-001").
 */
export function buildVisitorCode(yearPrefix: string, sequence: number): string {
  return `${yearPrefix}-${formatVisitorCodeSequence(sequence)}`;
}

/**
 * Parses the sequence number from an existing visitor code (e.g. "26-001" → 1).
 * Returns 0 if the code format is invalid.
 */
export function parseVisitorCodeSequence(visitorCode: string): number {
  const match = visitorCode.match(/^\d{2}-(\d+)$/);
  if (!match) {
    return 0;
  }

  return Number.parseInt(match[1], 10);
}

/**
 * Validates that a visitor code matches the expected format (YY-XXX).
 */
export function isValidVisitorCodeFormat(visitorCode: string): boolean {
  return /^\d{2}-\d{3,}$/.test(visitorCode);
}
