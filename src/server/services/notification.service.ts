import { APP_NAME } from "@/lib/constants";
import { getAppBaseUrl, sendMail } from "@/server/mail";
import { prisma } from "@/server/prisma/client";
import { getSystemSettings } from "@/server/services/settings.service";
import { getHostEmail, type VisitorWithCreator } from "@/types/visitor";

function formatWhen(value: Date | string | null | undefined): string {
  if (!value) {
    return "—";
  }

  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

async function resolveHostEmail(personToMeet: string): Promise<string | null> {
  const configured = getHostEmail(personToMeet);
  if (configured) {
    return configured;
  }

  const employee = await prisma.employee.findFirst({
    where: {
      fullName: { equals: personToMeet.trim(), mode: "insensitive" },
      isActive: true,
      email: { not: null },
    },
    select: { email: true },
  });

  return employee?.email ?? null;
}

function buildVisitorEventContent(
  visitor: VisitorWithCreator,
  event: "check-in" | "check-out",
  companyName: string,
) {
  const title =
    event === "check-in" ? "Visitor checked in" : "Visitor checked out";
  const when =
    event === "check-in"
      ? formatWhen(visitor.checkInTime)
      : formatWhen(visitor.checkOutTime);

  const lines = [
    `${title} — ${companyName}`,
    "",
    `Visitor: ${visitor.fullName} (${visitor.visitorCode})`,
    `Phone: ${visitor.phone}`,
    `Company: ${visitor.company || "—"}`,
    `Purpose: ${visitor.purpose}`,
    `Host: ${visitor.personToMeet}`,
    `Time: ${when}`,
    "",
    `View details: ${getAppBaseUrl()}/visitors/${visitor.id}`,
  ];

  return {
    subject: `${APP_NAME} — ${title}: ${visitor.fullName}`,
    text: lines.join("\n"),
    html: `
      <h2>${title}</h2>
      <p><strong>Visitor:</strong> ${visitor.fullName} (${visitor.visitorCode})</p>
      <p><strong>Phone:</strong> ${visitor.phone}</p>
      <p><strong>Company:</strong> ${visitor.company || "—"}</p>
      <p><strong>Purpose:</strong> ${visitor.purpose}</p>
      <p><strong>Host:</strong> ${visitor.personToMeet}</p>
      <p><strong>Time:</strong> ${when}</p>
      <p><a href="${getAppBaseUrl()}/visitors/${visitor.id}">Open visitor record</a></p>
    `,
  };
}

async function sendUnique(
  recipients: string[],
  content: { subject: string; text: string; html: string },
) {
  const unique = Array.from(
    new Set(
      recipients.map((email) => email.trim().toLowerCase()).filter(Boolean),
    ),
  );

  for (const to of unique) {
    await sendMail({ to, ...content });
  }
}

export async function notifyVisitorCheckIn(
  visitor: VisitorWithCreator,
): Promise<void> {
  try {
    const settings = await getSystemSettings();
    const content = buildVisitorEventContent(
      visitor,
      "check-in",
      settings.companyName,
    );
    const recipients: string[] = [];

    if (settings.notifyHostOnCheckIn) {
      const hostEmail = await resolveHostEmail(visitor.personToMeet);
      if (hostEmail) {
        recipients.push(hostEmail);
      }
    }

    if (settings.notifyAdminOnCheckIn && settings.adminNotificationEmail) {
      recipients.push(settings.adminNotificationEmail);
    }

    if (recipients.length === 0) {
      return;
    }

    await sendUnique(recipients, content);
  } catch (error) {
    console.error("[notify] Check-in notification failed:", error);
  }
}

export async function notifyVisitorCheckOut(
  visitor: VisitorWithCreator,
): Promise<void> {
  try {
    const settings = await getSystemSettings();
    const content = buildVisitorEventContent(
      visitor,
      "check-out",
      settings.companyName,
    );
    const recipients: string[] = [];

    if (settings.notifyHostOnCheckOut) {
      const hostEmail = await resolveHostEmail(visitor.personToMeet);
      if (hostEmail) {
        recipients.push(hostEmail);
      }
    }

    if (settings.notifyAdminOnCheckOut && settings.adminNotificationEmail) {
      recipients.push(settings.adminNotificationEmail);
    }

    if (recipients.length === 0) {
      return;
    }

    await sendUnique(recipients, content);
  } catch (error) {
    console.error("[notify] Check-out notification failed:", error);
  }
}
