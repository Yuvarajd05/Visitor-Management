import type { VisitorStatus } from "@/server/prisma/generated/client";

export interface VisitorRecord {
  id: string;
  visitorCode: string;
  fullName: string;
  phone: string;
  company: string | null;
  address: string | null;
  purpose: string;
  personToMeet: string;
  idProofType: string | null;
  idProofNumber: string | null;
  vehicleType: string | null;
  vehicleNumber: string | null;
  additionalMembers: number;
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
  address?: string;
  purpose: string;
  personToMeet: string;
  idProofType?: string;
  idProofNumber?: string;
  vehicleType?: string;
  vehicleNumber?: string;
  additionalMembers?: number;
  photoDataUrl?: string;
}

export interface UpdateVisitorInput {
  fullName?: string;
  phone?: string;
  company?: string | null;
  address?: string | null;
  purpose?: string;
  personToMeet?: string;
  idProofType?: string | null;
  idProofNumber?: string | null;
  vehicleType?: string | null;
  vehicleNumber?: string | null;
  additionalMembers?: number;
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

/** Preset visiting reasons / purpose options. */
export const VISITING_PURPOSE_OPTIONS = [
  "Official Meeting",
  "Personal Meeting",
  "Interview",
  "Guest",
  "Repair and maintenance",
  "Service",
  "Site Visit",
  "Exit Interview",
  "Education",
] as const;

export type VisitingPurposeOption = (typeof VISITING_PURPOSE_OPTIONS)[number];

/** Allows security to type a custom reason. */
export const PURPOSE_OTHER_OPTION = "Other" as const;

/**
 * Host contacts for "Person to Meet" (required dropdown).
 * Empty email skips host notification until addresses are provided.
 */
export const HOST_CONTACTS = [
  { name: "Ramraj Duraisamy", email: "" },
  { name: "K S Pai", email: "" },
  { name: "Vasudev Kalluraya", email: "" },
  { name: "Prasanna Shenoy", email: "" },
  { name: "Narasimha Mallya", email: "" },
  { name: "Krithika Saralaya", email: "" },
  { name: "Security", email: "" },
  { name: "Reception Desk", email: "" },
  { name: "HR Department", email: "" },
  { name: "IT Support", email: "" },
  { name: "Admin Office", email: "" },
] as const;

export const PERSON_TO_MEET_OPTIONS = HOST_CONTACTS.map((host) => host.name);

export type PersonToMeetOption = (typeof HOST_CONTACTS)[number]["name"];

/** Allows security to type a person/host not in the list. */
export const PERSON_TO_MEET_OTHER_OPTION = "Other" as const;

export const VEHICLE_TYPE_OPTIONS = [
  "Personal Car",
  "Two - Wheelers",
  "Delivery Vans",
  "VIP & Executive",
  "Public Transportation",
  "Auto-Rickshaws",
] as const;

export type VehicleTypeOption = (typeof VEHICLE_TYPE_OPTIONS)[number];

/** Allows security to type a vehicle type not in the list. */
export const VEHICLE_TYPE_OTHER_OPTION = "Other" as const;

export function getHostEmail(personToMeet: string): string | null {
  const match = HOST_CONTACTS.find(
    (host) => host.name.toLowerCase() === personToMeet.trim().toLowerCase(),
  );
  const email = match?.email?.trim();
  return email ? email : null;
}
