/**
 * Application configuration.
 * Prefer reading env through these helpers instead of scattering process.env.
 */

export const appConfig = {
  name:
    process.env.NEXT_PUBLIC_APP_NAME ?? "Invenger Visitor Management System",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  isProduction: process.env.NODE_ENV === "production",
} as const;

export const storageConfig = {
  root: "storage",
  visitorPhotos: "storage/visitor-photos",
  uploads: "storage/uploads",
  temp: "storage/temp",
} as const;
