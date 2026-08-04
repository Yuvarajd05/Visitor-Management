import type { Prisma } from "@/server/prisma/generated/client";

import { ConflictError, NotFoundError } from "@/server/api/errors";
import {
  createEmployeeRecord,
  deleteEmployeeRecord,
  findEmployeeByEmail,
  findEmployeeById,
  generateNextEmployeeCode,
  listEmployeeRecords,
  runEmployeeTransaction,
  updateEmployeeRecord,
} from "@/server/repositories/employee.repository";
import type {
  CreateEmployeeInput,
  EmployeeListQuery,
  EmployeeListResult,
  EmployeeRecord,
  UpdateEmployeeInput,
} from "@/types/employee";
import type {
  CreateEmployeeFormValues,
  EmployeeListQueryValues,
  UpdateEmployeeFormValues,
} from "@/server/validation/employee";

function buildSearchFilter(search?: string): Prisma.EmployeeWhereInput | undefined {
  if (!search) {
    return undefined;
  }

  const term = search.trim();
  if (!term) {
    return undefined;
  }

  return {
    OR: [
      { employeeCode: { contains: term, mode: "insensitive" } },
      { fullName: { contains: term, mode: "insensitive" } },
      { phone: { contains: term } },
      { email: { contains: term, mode: "insensitive" } },
      { department: { contains: term, mode: "insensitive" } },
      { designation: { contains: term, mode: "insensitive" } },
    ],
  };
}

function buildListWhere(query: EmployeeListQueryValues): Prisma.EmployeeWhereInput {
  const filters: Prisma.EmployeeWhereInput[] = [];
  const searchFilter = buildSearchFilter(query.search);

  if (searchFilter) {
    filters.push(searchFilter);
  }

  if (query.status === "ACTIVE") {
    filters.push({ isActive: true });
  } else if (query.status === "INACTIVE") {
    filters.push({ isActive: false });
  }

  if (filters.length === 0) {
    return {};
  }

  return { AND: filters };
}

function buildListOrderBy(
  query: EmployeeListQueryValues,
): Prisma.EmployeeOrderByWithRelationInput {
  return {
    [query.sortBy]: query.sortOrder,
  };
}

async function assertUniqueEmail(
  email: string | null | undefined,
  excludeId?: string,
) {
  if (!email) {
    return;
  }

  const existing = await findEmployeeByEmail(email, excludeId);
  if (existing) {
    throw new ConflictError("An employee with this email already exists.");
  }
}

export async function createEmployee(
  input: CreateEmployeeInput | CreateEmployeeFormValues,
): Promise<EmployeeRecord> {
  await assertUniqueEmail(input.email);

  return runEmployeeTransaction(async (tx) => {
    const employeeCode = await generateNextEmployeeCode(tx);

    return createEmployeeRecord(tx, {
      employeeCode,
      fullName: input.fullName,
      email: input.email ?? null,
      phone: input.phone,
      department: input.department,
      designation: input.designation,
      isActive: input.isActive ?? true,
    });
  });
}

export async function listEmployees(
  query: EmployeeListQuery | EmployeeListQueryValues,
): Promise<EmployeeListResult> {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 10;
  const where = buildListWhere(query as EmployeeListQueryValues);
  const orderBy = buildListOrderBy(query as EmployeeListQueryValues);
  const skip = (page - 1) * pageSize;

  const { employees, total } = await listEmployeeRecords({
    where,
    orderBy,
    skip,
    take: pageSize,
  });

  return {
    employees,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getEmployeeById(id: string): Promise<EmployeeRecord> {
  const employee = await findEmployeeById(id);

  if (!employee) {
    throw new NotFoundError("Employee");
  }

  return employee;
}

export async function updateEmployee(
  id: string,
  input: UpdateEmployeeInput | UpdateEmployeeFormValues,
): Promise<EmployeeRecord> {
  await getEmployeeById(id);

  if (input.email !== undefined) {
    await assertUniqueEmail(input.email, id);
  }

  const data: Prisma.EmployeeUpdateInput = {};

  if (input.fullName !== undefined) data.fullName = input.fullName;
  if (input.email !== undefined) data.email = input.email;
  if (input.phone !== undefined) data.phone = input.phone;
  if (input.department !== undefined) data.department = input.department;
  if (input.designation !== undefined) data.designation = input.designation;
  if (input.isActive !== undefined) data.isActive = input.isActive;

  return updateEmployeeRecord(id, data);
}

export async function deleteEmployee(id: string): Promise<void> {
  await getEmployeeById(id);
  await deleteEmployeeRecord(id);
}
