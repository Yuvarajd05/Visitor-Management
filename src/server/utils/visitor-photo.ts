import { copyFile, mkdir, unlink, writeFile } from "fs/promises";
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

function assertImageMagicBytes(buffer: Buffer, mime: string): void {
  const isJpeg =
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff;
  const isPng =
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a;
  const isWebp =
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP";

  const mimeOk =
    (mime === "image/jpeg" || mime === "image/jpg" ? isJpeg : false) ||
    (mime === "image/png" ? isPng : false) ||
    (mime === "image/webp" ? isWebp : false);

  if (!mimeOk) {
    throw new ValidationError(
      "Invalid photo data. Upload a real JPEG, PNG, or WebP image.",
    );
  }
}

export function getVisitorPhotoAbsolutePath(filename: string): string {
  return path.join(UPLOAD_DIR, path.basename(filename));
}

function resolveManagedPhotoPath(photoUrl: string): string | null {
  const isManaged =
    photoUrl.startsWith(PUBLIC_URL_PREFIX) ||
    photoUrl.startsWith(LEGACY_URL_PREFIX);

  if (!isManaged) {
    return null;
  }

  const filename = path.basename(photoUrl);

  if (photoUrl.startsWith(PUBLIC_URL_PREFIX)) {
    return path.join(UPLOAD_DIR, filename);
  }

  return path.join(process.cwd(), "public", "uploads", "visitors", filename);
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

  assertImageMagicBytes(buffer, mime);

  await mkdir(UPLOAD_DIR, { recursive: true });

  const filename = `${visitorId}.${extensionForMime(mime)}`;
  const filePath = path.join(UPLOAD_DIR, filename);
  await writeFile(filePath, buffer);

  return `${PUBLIC_URL_PREFIX}${filename}`;
}

/** Copy a previous visitor photo onto a new visitor id (returning-guest flow). */
export async function copyVisitorPhotoFromUrl(
  visitorId: string,
  sourcePhotoUrl: string,
): Promise<string | null> {
  const sourcePath = resolveManagedPhotoPath(sourcePhotoUrl);
  if (!sourcePath) {
    return null;
  }

  const ext = path.extname(sourcePath) || ".jpg";
  const filename = `${visitorId}${ext}`;
  const destPath = path.join(UPLOAD_DIR, filename);

  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
    await copyFile(sourcePath, destPath);
  } catch {
    return null;
  }

  return `${PUBLIC_URL_PREFIX}${filename}`;
}

export async function deleteVisitorPhotoFile(
  photoUrl: string | null | undefined,
): Promise<void> {
  if (!photoUrl) {
    return;
  }

  const filePath = resolveManagedPhotoPath(photoUrl);
  if (!filePath) {
    return;
  }

  const candidates = [
    filePath,
    path.join(UPLOAD_DIR, path.basename(photoUrl)),
    path.join(
      process.cwd(),
      "public",
      "uploads",
      "visitors",
      path.basename(photoUrl),
    ),
  ];

  for (const candidate of candidates) {
    try {
      await unlink(candidate);
    } catch {
      // File may already be missing.
    }
  }
}
