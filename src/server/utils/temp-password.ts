import { randomBytes } from "crypto";

/**
 * Generates a temporary password that satisfies password policy:
 * 8+ chars, upper, lower, number.
 */
export function generateTemporaryPassword(length = 12): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const digits = "23456789";
  const all = upper + lower + digits;

  const bytes = randomBytes(length);
  const chars = [
    upper[bytes[0]! % upper.length]!,
    lower[bytes[1]! % lower.length]!,
    digits[bytes[2]! % digits.length]!,
  ];

  for (let i = 3; i < length; i += 1) {
    chars.push(all[bytes[i]! % all.length]!);
  }

  // Shuffle
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = bytes[i]! % (i + 1);
    [chars[i], chars[j]] = [chars[j]!, chars[i]!];
  }

  return chars.join("");
}
