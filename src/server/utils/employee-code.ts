/**
 * Formats a sequence number into the employee code suffix (e.g. 1 → "001").
 */
export function formatEmployeeCodeSequence(sequence: number): string {
  return String(sequence).padStart(3, "0");
}

/**
 * Builds a complete employee code from sequence (e.g. 1 → "EMP-001").
 */
export function buildEmployeeCode(sequence: number): string {
  return `EMP-${formatEmployeeCodeSequence(sequence)}`;
}

/**
 * Parses the sequence number from an existing employee code (e.g. "EMP-001" → 1).
 * Returns 0 if the code format is invalid.
 */
export function parseEmployeeCodeSequence(employeeCode: string): number {
  const match = employeeCode.match(/^EMP-(\d+)$/i);
  if (!match) {
    return 0;
  }

  return Number.parseInt(match[1], 10);
}

/**
 * Validates that an employee code matches the expected format (EMP-XXX).
 */
export function isValidEmployeeCodeFormat(employeeCode: string): boolean {
  return /^EMP-\d{3,}$/i.test(employeeCode);
}
