import type { VisitorStatus } from "@/lib/generated/prisma/client";

export interface VisitorRecord {
  id: string;
  visitorCode: string;
  fullName: string;
  phone: string;
  company: string;
  purpose: string;
  personToMeet: string;
  idProofType: string | null;
  idProofNumber: string | null;
  vehicleNumber: string | null;
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
  company: string;
  personToMeet: string;
  purpose: string;
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
  company: string;
  purpose: string;
  personToMeet: string;
  idProofType?: string;
  idProofNumber?: string;
  vehicleNumber?: string;
}

export interface UpdateVisitorInput {
  fullName?: string;
  phone?: string;
  company?: string;
  purpose?: string;
  personToMeet?: string;
  idProofType?: string | null;
  idProofNumber?: string | null;
  vehicleNumber?: string | null;
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
