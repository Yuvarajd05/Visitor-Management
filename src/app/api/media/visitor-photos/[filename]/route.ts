import { readFile, access } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

import { handleRouteError, requireApiUser } from "@/server/api";
import { getVisitorPhotoAbsolutePath } from "@/server/utils/visitor-photo";

interface RouteContext {
  params: Promise<{ filename: string }>;
}

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireApiUser();

    const { filename } = await context.params;
    const safeName = path.basename(filename);

    if (!safeName || safeName !== filename || filename.includes("..")) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const filePath = getVisitorPhotoAbsolutePath(safeName);

    try {
      await access(filePath);
    } catch {
      // Fall back to legacy public uploads during migration.
      const legacy = path.join(
        process.cwd(),
        "public",
        "uploads",
        "visitors",
        safeName,
      );
      try {
        await access(legacy);
        const buffer = await readFile(legacy);
        const ext = path.extname(safeName).toLowerCase();
        return new NextResponse(new Uint8Array(buffer), {
          headers: {
            "Content-Type": CONTENT_TYPES[ext] ?? "application/octet-stream",
            "Cache-Control": "private, max-age=3600",
          },
        });
      } catch {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
    }

    const buffer = await readFile(filePath);
    const ext = path.extname(safeName).toLowerCase();

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": CONTENT_TYPES[ext] ?? "application/octet-stream",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    return handleRouteError(error, {
      path: "/api/media/visitor-photos/[filename]",
      method: "GET",
    });
  }
}
