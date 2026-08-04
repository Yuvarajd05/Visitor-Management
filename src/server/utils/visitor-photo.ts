import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

import { ValidationError } from "@/server/api/errors";

const MAX_PHOTO_BYTES = 800_000;
const UPLOAD_DIR = path.join(process.cwd(), "storage", "visitor-photos");
const PUBLIC_URL_PREFIX = "/api/media/visitor-photos/";
const LEGACY_URL_PREFIX = "/uploads/visitors/";

const DATA_URL_PATTERN =
  /^data:(image\/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/=]+)$/;

function extensionForMime(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

export function getVisitorPhotoAbsolutePath(filename: string): string {
  return path.join(UPLOAD_DIR, path.basename(filename));
}

export async function saveVisitorPhotoFromDataUrl(
  visitorId: string,
  dataUrl: string,
): Promise<string> {
  const match = DATA_URL_PATTERN.exec(dataUrl.trim());

  if (!match) {
    throw new ValidationError("Invalid photo format. Use a JPEG or PNG image.");
  }

  const mime = match[1];
  const buffer = Buffer.from(match[2], "base64");

  if (buffer.byteLength === 0) {
    throw new ValidationError("Photo data is empty.");
  }

  if (buffer.byteLength > MAX_PHOTO_BYTES) {
    throw new ValidationError("Photo is too large. Keep it under 800 KB.");
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const filename = `${visitorId}.${extensionForMime(mime)}`;
  const filePath = path.join(UPLOAD_DIR, filename);
  await writeFile(filePath, buffer);

  return `${PUBLIC_URL_PREFIX}${filename}`;
}

export async function deleteVisitorPhotoFile(
  photoUrl: string | null | undefined,
): Promise<void> {
  if (!photoUrl) {
    return;
  }

  const isManaged =
    photoUrl.startsWith(PUBLIC_URL_PREFIX) ||
    photoUrl.startsWith(LEGACY_URL_PREFIX);

  if (!isManaged) {
    return;
  }

  const filename = path.basename(photoUrl);
  const candidates = [
    path.join(UPLOAD_DIR, filename),
    path.join(process.cwd(), "public", "uploads", "visitors", filename),
  ];

  for (const filePath of candidates) {
    try {
      await unlink(filePath);
    } catch {
      // File may already be missing.
    }
  }
}
