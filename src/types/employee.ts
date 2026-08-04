export interface EmployeeRecord {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string | null;
  phone: string;
  department: string;
  designation: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type EmployeeListItem = EmployeeRecord;

export interface EmployeeListResult {
  employees: EmployeeListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface EmployeeListQuery {
  search?: string;
  status?: "ALL" | "ACTIVE" | "INACTIVE";
  page?: number;
  pageSize?: number;
  sortBy?: "fullName" | "employeeCode" | "department" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface CreateEmployeeInput {
  fullName: string;
  email?: string;
  phone: string;
  department: string;
  designation: string;
  isActive?: boolean;
}

export interface UpdateEmployeeInput {
  fullName?: string;
  email?: string | null;
  phone?: string;
  department?: string;
  designation?: string;
  isActive?: boolean;
}

export const DEPARTMENTS = [
  "Engineering",
  "HR",
  "Finance",
  "Sales",
  "Marketing",
  "Operations",
  "IT Support",
  "Administration",
  "Other",
] as const;

export type Department = (typeof DEPARTMENTS)[number];
