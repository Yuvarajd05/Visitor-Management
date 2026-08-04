import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

import { APP_NAME } from "@/lib/constants";
import { getSystemSettings } from "@/server/services/settings.service";

export type MailDeliveryResult = {
  emailed: boolean;
  mode: "smtp" | "ethereal" | "none";
  previewUrl?: string;
  error?: string;
};

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  pass?: string;
  from: string;
};

let cachedEtherealTransporter: Transporter | null = null;

export function getAppBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    process.env.APP_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

async function resolveSmtpConfig(): Promise<SmtpConfig | null> {
  const settings = await getSystemSettings();

  const host = settings.smtpHost?.trim() || process.env.SMTP_HOST?.trim();
  const from = settings.smtpFrom?.trim() || process.env.SMTP_FROM?.trim();

  if (!host || !from) {
    return null;
  }

  return {
    host,
    port: settings.smtpHost?.trim()
      ? settings.smtpPort
      : Number(process.env.SMTP_PORT ?? "587"),
    secure: settings.smtpHost?.trim()
      ? settings.smtpSecure
      : process.env.SMTP_SECURE === "true",
    user: settings.smtpUser?.trim() || process.env.SMTP_USER?.trim() || undefined,
    pass: settings.smtpPass?.trim() || process.env.SMTP_PASS?.trim() || undefined,
    from,
  };
}

function createSmtpTransporter(config: SmtpConfig): Transporter {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth:
      config.user && config.pass
        ? {
            user: config.user,
            pass: config.pass,
          }
        : undefined,
  });
}

async function createEtherealTransporter(): Promise<Transporter> {
  if (cachedEtherealTransporter) {
    return cachedEtherealTransporter;
  }

  const testAccount = await nodemailer.createTestAccount();
  cachedEtherealTransporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  console.info(`[mail] Ethereal test inbox ready. User: ${testAccount.user}`);
  return cachedEtherealTransporter;
}

export async function sendMail(options: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<MailDeliveryResult> {
  const { to, subject, text, html } = options;

  try {
    const smtp = await resolveSmtpConfig();

    if (smtp) {
      const transporter = createSmtpTransporter(smtp);
      await transporter.sendMail({
        from: smtp.from,
        to,
        subject,
        text,
        html,
      });

      console.info(`[mail] Sent via SMTP to ${to}: ${subject}`);
      return { emailed: true, mode: "smtp" };
    }

    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[mail] SMTP is not configured. Set SMTP in Settings or .env.",
      );
      return { emailed: false, mode: "none", error: "SMTP is not configured." };
    }

    const transporter = await createEtherealTransporter();
    const info = await transporter.sendMail({
      from: `"${APP_NAME}" <noreply@invenger.local>`,
      to,
      subject,
      text,
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
    console.info(`[mail] Ethereal preview: ${previewUrl}`);

    return { emailed: true, mode: "ethereal", previewUrl };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to send email.";
    console.error("[mail] Failed to send email:", error);
    return { emailed: false, mode: "none", error: message };
  }
}

export async function sendTestEmail(to: string): Promise<MailDeliveryResult> {
  return sendMail({
    to,
    subject: `${APP_NAME} — SMTP test`,
    text: "This is a test email from Invenger VMS. SMTP is working.",
    html: "<p>This is a test email from <strong>Invenger VMS</strong>. SMTP is working.</p>",
  });
}
