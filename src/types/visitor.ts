import type { VisitorStatus } from "@/server/prisma/generated/client";

export interface VisitorRecord {
  id: string;
  visitorCode: string;
  fullName: string;
  phone: string;
  company: string | null;
  purpose: string;
  personToMeet: string;
  idProofType: string | null;
  idProofNumber: string | null;
  vehicleNumber: string | null;
  photoUrl: string | null;
  checkInTime: Date;
  checkOutTime: Date | null;
  status: VisitorStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VisitorWithCreator extends VisitorRecord {
  creator: {
    id: string;
    name: string;
    email: string;
  };
}

export interface VisitorListItem {
  id: string;
  visitorCode: string;
  fullName: string;
  phone: string;
  company: string | null;
  personToMeet: string;
  purpose: string;
  photoUrl: string | null;
  checkInTime: Date;
  checkOutTime: Date | null;
  status: VisitorStatus;
}

export interface VisitorListResult {
  visitors: VisitorListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface VisitorListQuery {
  search?: string;
  status?: VisitorStatus | "ALL";
  page?: number;
  pageSize?: number;
  sortBy?: "checkInTime" | "fullName" | "visitorCode";
  sortOrder?: "asc" | "desc";
}

export interface CreateVisitorInput {
  fullName: string;
  phone: string;
  company?: string;
  purpose: string;
  personToMeet: string;
  idProofType?: string;
  idProofNumber?: string;
  vehicleNumber?: string;
  photoDataUrl?: string;
}

export interface UpdateVisitorInput {
  fullName?: string;
  phone?: string;
  company?: string | null;
  purpose?: string;
  personToMeet?: string;
  idProofType?: string | null;
  idProofNumber?: string | null;
  vehicleNumber?: string | null;
  photoDataUrl?: string | null;
}

export const ID_PROOF_TYPES = [
  "Aadhaar",
  "PAN",
  "Driving License",
  "Passport",
  "Voter ID",
  "Employee ID",
  "Other",
] as const;

export type IdProofType = (typeof ID_PROOF_TYPES)[number];

/**
 * Host contacts for "Person to Meet".
 * Add real names + emails here when ready. Empty email skips host notify.
 */
export const HOST_CONTACTS = [
  { name: "Reception Desk", email: "" },
  { name: "HR Department", email: "" },
  { name: "IT Support", email: "" },
  { name: "Admin Office", email: "" },
] as const;

export const PERSON_TO_MEET_OPTIONS = HOST_CONTACTS.map((host) => host.name);

export type PersonToMeetOption = (typeof HOST_CONTACTS)[number]["name"];

export function getHostEmail(personToMeet: string): string | null {
  const match = HOST_CONTACTS.find(
    (host) => host.name.toLowerCase() === personToMeet.trim().toLowerCase(),
  );
  const email = match?.email?.trim();
  return email ? email : null;
}
